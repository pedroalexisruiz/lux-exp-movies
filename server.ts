import 'dotenv/config';
import fs from 'node:fs/promises';
import express from 'express';
import compression from 'compression';
import sirv from 'sirv';
import { createServer as createViteServer, ViteDevServer } from 'vite';
import { makeMovieRouter } from './src/api/infrastructure/controllers';
import Beasties from 'beasties';

const isProduction = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT) || 5173;
const host = process.env.HOST ?? '127.0.0.1';
const base = process.env.BASE || '/';

const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

const critter = isProduction
  ? new Beasties({
      path: './dist/client',
      publicPath: base,
      preload: 'swap',
      reduceInlineStyles: true,
      inlineThreshold: 0,
      keyframes: 'critical',
      compress: true,
      logLevel: 'silent',
    })
  : null;

const htmlCache = new Map<string, string>();

function createApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/movies', makeMovieRouter());
  return app;
}

async function setupAssets(app: express.Express) {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
      base,
    });
    app.use(vite.middlewares);
    return vite;
  } else {
    app.use(compression());
    app.use(base, sirv('./dist/client', { extensions: [] }));
    return undefined;
  }
}

function normalizeUrl(originalUrl: string) {
  let url = originalUrl.replace(base, '');
  if (!url.startsWith('/')) url = '/' + url;
  return url;
}

async function getTemplateAndRender(url: string, vite?: ViteDevServer) {
  if (!isProduction) {
    let template = await fs.readFile('./index.html', 'utf-8');
    template = await vite!.transformIndexHtml(url, template);
    const render = (await vite!.ssrLoadModule('/src/entry-server.tsx')).render;
    return { template, render };
  } else {
    const template = templateHtml;
    const mod = await import('./dist/server/entry-server.js');
    const render = mod.render;
    return { template, render };
  }
}

function withState(template: string, head: string, html: string, initialState?: unknown) {
  const stateScript = initialState
    ? `<script>window.__INITIAL_STATE__=${JSON.stringify(initialState).replace(/</g, '\\u003c')}</script>`
    : '';
  return template
    .replace('<!--app-head-->', `${head}${stateScript}`)
    .replace('<!--app-html-->', html ?? '');
}

async function inlineCriticalCss(url: string, html: string) {
  if (!isProduction) return html;
  const cacheKey = url;
  const cached = htmlCache.get(cacheKey);
  if (cached) return cached;
  const processed = await critter!.process(html);
  htmlCache.set(cacheKey, processed);
  return processed;
}

const app = createApp();

const vite = await setupAssets(app);

app.use(/.*/, async (req, res) => {
  try {
    const url = normalizeUrl(req.originalUrl);
    const { template, render } = await getTemplateAndRender(url, vite);
    const ssrContext = { req, res };
    const { html, head = '', initialState } = await render(url, ssrContext);
    const merged = withState(template, head, html, initialState);
    const finalHtml = await inlineCriticalCss(url, merged);
    res.status(200).set({ 'Content-Type': 'text/html' }).send(finalHtml);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    vite?.ssrFixStacktrace?.(e);
    console.log(e.stack);
    res.status(500).end(e.stack);
  }
});

app.listen(port, host, () => {
  console.log(`Server started at port ${port}`);
});
