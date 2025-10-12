import { CacheAdapter, CacheEntry } from './CacheAdapter';
import { persistentCache } from './persistentCache';

export class PersistentFsCache implements CacheAdapter {
  ensureLoaded() {
    return persistentCache.ensureLoaded();
  }
  get<T>(key: string) {
    return persistentCache.get<T>(key);
  }
  set<T>(key: string, entry: CacheEntry<T>) {
    return persistentCache.set<T>(key, entry);
  }
  close() {
    return persistentCache.close();
  }
}
