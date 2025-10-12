import type { RequestHandler } from 'express';

type CacheOpts = {
  privacy?: 'public' | 'private';
  maxAge?: number;
  staleWhileRevalidate?: number;
  immutable?: boolean;
  vary?: string[] | string;
};

export const cacheControl = (opts: CacheOpts = {}): RequestHandler => {
  const {
    privacy = 'public',
    maxAge = 60,
    staleWhileRevalidate = 300,
    immutable = false,
    vary,
  } = opts;

  const parts = [`${privacy}`, `max-age=${maxAge}`];
  if (staleWhileRevalidate > 0) parts.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  if (immutable) parts.push('immutable');

  return (_req, res, next) => {
    if (!res.get('Cache-Control')) res.set('Cache-Control', parts.join(', '));

    if (Array.isArray(vary) && vary.length > 0) {
      res.vary(vary.join(', '));
    } else if (typeof vary === 'string' && vary.length > 0) {
      res.vary(vary);
    }

    next();
  };
};
