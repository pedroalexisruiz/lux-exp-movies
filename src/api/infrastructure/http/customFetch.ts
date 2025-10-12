import { HttpError } from '@infrastructure/exceptions/HttpError';
import { type CacheEntry } from '@infrastructure/cache';
import { cacheAdapter } from '@infrastructure/factories';

interface FetchJsonOptions extends RequestInit {
  cacheTtlMs?: number;
}

export async function fetchJson<T>(input: RequestInfo | URL, init?: FetchJsonOptions): Promise<T> {
  await cacheAdapter.ensureLoaded?.();

  const url = typeof input === 'string' ? input : input.toString();
  const method = init?.method?.toUpperCase() || 'GET';
  const key = `${method}:${url}`;
  const ttl = init?.cacheTtlMs ?? 5 * 60_000;
  const now = Date.now();

  const cached = await cacheAdapter.get<T>(key);
  if (cached && cached.expiresAt > now) return cached.value;

  const headers = new Headers({ accept: 'application/json', ...(init?.headers ?? {}) });
  if (cached?.etag) headers.set('If-None-Match', cached.etag);

  let res: Response;
  try {
    res = await fetch(input, { ...init, headers });
  } catch (e) {
    throw new HttpError('Network error', 0, undefined, { cause: e });
  }

  if (res.status === 304 && cached) {
    const updated: CacheEntry<T> = { ...cached, expiresAt: now + ttl };
    await cacheAdapter.set(key, updated);
    return updated.value;
  }

  const ct = res.headers.get('content-type') ?? '';
  const body = ct.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) throw new HttpError(`Request failed with ${res.status}`, res.status, body);

  const etag = res.headers.get('ETag') || undefined;
  await cacheAdapter.set(key, { value: body, etag, expiresAt: now + ttl });
  return body as T;
}
