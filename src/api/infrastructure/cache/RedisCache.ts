import { createClient, type RedisClientType } from 'redis';
import { CacheAdapter, CacheEntry } from './CacheAdapter';

export class RedisCache implements CacheAdapter {
  private client: RedisClientType;
  constructor(url = process.env.REDIS_URL!) {
    this.client = createClient({ url });
    this.client.on('error', (e: unknown) => console.error('Redis error', e));
  }

  async ensureLoaded() {
    if (!this.client.isOpen) await this.client.connect();
  }

  async get<T>(key: string): Promise<CacheEntry<T> | undefined> {
    const raw = await this.client.get(key);
    if (!raw) return;
    const entry = JSON.parse(raw) as CacheEntry<T>;
    if (entry.expiresAt <= Date.now()) {
      await this.client.del(key);
      return;
    }
    return entry;
  }

  async set<T>(key: string, entry: CacheEntry<T>): Promise<void> {
    const ttlSec = Math.max(1, Math.floor((entry.expiresAt - Date.now()) / 1000));
    await this.client.set(key, JSON.stringify(entry), { EX: ttlSec });
  }

  async del(key: string) {
    await this.client.del(key);
  }
  async close() {
    if (this.client.isOpen) await this.client.quit();
  }
}
