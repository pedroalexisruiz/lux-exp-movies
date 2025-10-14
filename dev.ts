import { createServer as createViteServer } from 'vite';
import express from 'express';
import compression from 'compression';
import { createApp } from './server';

const port = Number(process.env.PORT || 5173);
const base = process.env.BASE || '/';

(async () => {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });

  const app = express();
  app.use(compression());
  app.use(vite.middlewares);

  const ssrApp = createApp({ vite, base });
  app.use(ssrApp);

  app.listen(port, () => {
    console.log(`Dev server + SSR listo en http://localhost:${port}`);
  });
})();
