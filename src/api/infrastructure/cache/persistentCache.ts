import fs from 'node:fs/promises';
import path from 'node:path';
import { MemoryCache } from './memoryCache';
import { CacheEntry } from './CacheAdapter';
import { MAX_CACHE, DEFAULT_FILE_NAME } from './constants';

const CWD = process.cwd();
const DEFAULT_FILE = path.join(CWD, '.cache', DEFAULT_FILE_NAME);

function ensureDirExists(p: string) {
  return fs.mkdir(path.dirname(p), { recursive: true });
}

async function writeFileAtomic(file: string, data: string) {
  const tmp = `${file}.tmp`;
  await ensureDirExists(file);
  await fs.writeFile(tmp, data, 'utf8');
  await fs.rename(tmp, file);
}

function isExpired(entry: CacheEntry) {
  return entry.expiresAt <= Date.now();
}

export class PersistentLruCache {
  private lru: MemoryCache;
  private file: string;
  private loaded = false;
  private saveTimer: NodeJS.Timeout | null = null;
  private saveDelayMs = 250;

  constructor(file = DEFAULT_FILE, max = MAX_CACHE) {
    this.lru = new MemoryCache(max);
    this.file = file;
  }

  async ensureLoaded() {
    if (this.loaded) return;
    try {
      const json = await fs.readFile(this.file, 'utf8').catch(() => '');
      if (json) {
        const parsed = JSON.parse(json) as Record<string, CacheEntry>;
        Object.entries(parsed).forEach(([k, v]) => {
          if (!isExpired(v)) this.lru.set(k, v);
        });
      }
    } catch {
      console.warn('Cache file is corrupted, starting fresh');
    } finally {
      this.loaded = true;
    }
  }

  private scheduleSave() {
    if (this.saveTimer) return;
    this.saveTimer = setTimeout(() => {
      this.saveTimer = null;
      void this.save().catch(() => {});
    }, this.saveDelayMs);
  }

  private async save() {
    const obj: Record<string, CacheEntry> = {};
    const internalMap: Map<string, CacheEntry> = this.lru['map'];
    for (const [k, v] of internalMap.entries()) {
      if (!isExpired(v)) obj[k] = v;
    }
    await writeFileAtomic(this.file, JSON.stringify(obj));
  }

  async close() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    await this.save().catch(() => {});
  }

  get<T>(key: string) {
    return this.lru.get<T>(key);
  }

  set<T>(key: string, entry: CacheEntry<T>) {
    this.lru.set(key, entry);
    this.scheduleSave();
  }
}

export const persistentCache = new PersistentLruCache();
