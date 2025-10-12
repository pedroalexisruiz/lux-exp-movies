export type CacheEntry<T = unknown> = { value: T; etag?: string; expiresAt: number };

export interface CacheAdapter {
  ensureLoaded?(): Promise<void> | void;
  get<T = unknown>(key: string): Promise<CacheEntry<T> | undefined> | CacheEntry<T> | undefined;
  set<T = unknown>(key: string, entry: CacheEntry<T>): Promise<void> | void;
  del?(key: string): Promise<void> | void;
  close?(): Promise<void> | void;
}
