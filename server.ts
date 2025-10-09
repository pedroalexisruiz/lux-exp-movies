import 'dotenv/config';
import fs from 'node:fs/promises';
import express from 'express';
import compression from 'compression';
import sirv from 'sirv';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { makeMovieRouter } from './src/api/infrastructure/controllers';

const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.BASE || '/';

const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/movies', makeMovieRouter());

let vite: ViteDevServer | undefined;
if (!isProduction) {
  vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });
  app.use(vite.middlewares);
} else {
  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

app.use(/.*/, async (req, res) => {
  try {
    let url = req.originalUrl.replace(base, '');
    if (!url.startsWith('/')) url = '/' + url;

    let template;
    let render;

    if (!isProduction) {
      template = await fs.readFile('./index.html', 'utf-8');
      template = await vite!.transformIndexHtml(url, template);
      render = (await vite!.ssrLoadModule('/src/entry-server.tsx')).render;
    } else {
      template = templateHtml;
      const mod = await import('./dist/server/entry-server.js');
      render = mod.render;
    }

    const ssrContext = { req, res };
    const { html, head = '', initialState } = await render(url, ssrContext);

    const stateScript = initialState
      ? `<script>window.__INITIAL_STATE__=${JSON.stringify(initialState).replace(/</g, '\\u003c')}</script>`
      : '';

    const finalHtml = template
      .replace('<!--app-head-->', `${head}${stateScript}`)
      .replace('<!--app-html-->', html ?? '');

    res.status(200).set({ 'Content-Type': 'text/html' }).send(finalHtml);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    vite?.ssrFixStacktrace(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
