import { CacheEntry } from './CacheAdapter';
import { MAX_CACHE } from './constants';

export class MemoryCache {
  private map = new Map<string, CacheEntry>();
  constructor(private max = MAX_CACHE) {}

  get<T>(key: string): CacheEntry<T> | undefined {
    const value = this.map.get(key) as CacheEntry<T> | undefined;
    if (!value) return;
    this.map.delete(key);
    this.map.set(key, value);
    return value;
  }

  set<T>(key: string, entry: CacheEntry<T>) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, entry);
    if (this.map.size > this.max) {
      const firstKey = this.map.keys().next().value;
      if (firstKey) {
        this.map.delete(firstKey);
      }
    }
  }
}
