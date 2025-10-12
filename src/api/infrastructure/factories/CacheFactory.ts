import { CacheAdapter, InMemoryCache, PersistentFsCache, RedisCache } from '@infrastructure/cache';

export function makeCache(): CacheAdapter {
  const backend = (process.env.CACHE_BACKEND || 'memory').toLowerCase();
  switch (backend) {
    case 'persistent':
      return new PersistentFsCache();
    case 'redis':
      return new RedisCache();
    default:
      return new InMemoryCache();
  }
}

export const cacheAdapter: CacheAdapter = makeCache();
