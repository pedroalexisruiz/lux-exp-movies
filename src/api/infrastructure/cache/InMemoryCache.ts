import { CacheAdapter, CacheEntry } from './CacheAdapter';
import { MemoryCache } from './memoryCache';

export class InMemoryCache implements CacheAdapter {
  constructor(private memoryCache = new MemoryCache()) {}
  get<T>(key: string) {
    return this.memoryCache.get<T>(key);
  }
  set<T>(key: string, entry: CacheEntry<T>) {
    this.memoryCache.set(key, entry);
  }
}
