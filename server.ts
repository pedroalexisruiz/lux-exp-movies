import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import express from 'express';
import { ViteDevServer } from 'vite';
import { makeMovieRouter } from './src/api/infrastructure/controllers';
import Beasties from 'beasties';

type CreateAppOpts = {
  vite?: ViteDevServer | undefined;
  base?: string;
  production?: boolean;
};

const isProduction = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
const base = process.env.BASE || '/';

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

function normalizeUrl(originalUrl: string) {
  let url = originalUrl.replace(base, '');
  if (!url.startsWith('/')) url = '/' + url;
  return url;
}

function pathToFileUrl(p: string) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { pathToFileURL } = require('node:url');
  return pathToFileURL(p);
}

async function getTemplateAndRender(url: string, vite?: ViteDevServer) {
  if (!isProduction && vite) {
    let template = await fs.readFile('./index.html', 'utf-8');
    template = await vite!.transformIndexHtml(url, template);
    const render = (await vite!.ssrLoadModule('/src/entry-server.tsx')).render;
    return { template, render };
  } else {
    const template = await fs.readFile(
      path.resolve(process.cwd(), 'dist/client/index.html'),
      'utf-8',
    );
    const mod = await import(pathToFileUrl(path.resolve('dist/server/entry-server.js')).href);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const render = (mod as any).render as (
      url: string,
      ctx: Record<string, unknown>,
    ) => Promise<{ html: string; head?: string; initialState?: unknown }>;
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createApp({ vite, base: _base = base }: CreateAppOpts = {}) {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/api/movies', makeMovieRouter());

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

  return app;
}
