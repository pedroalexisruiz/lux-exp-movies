import { HttpError } from '../exceptions/HttpError';

export const isHttpError = (e: unknown): e is HttpError => e instanceof HttpError;

export async function fetchJson<T>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  let res: Response;

  try {
    res = await fetch(input, {
      ...init,
      headers: {
        accept: 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch (e) {
    throw new HttpError('Network error', 0, undefined, { cause: e });
  }

  const ct = res.headers.get('content-type') ?? '';
  const body = ct.includes('application/json')
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null);

  if (!res.ok) {
    throw new HttpError(`Request failed with ${res.status}`, res.status, body);
  }

  return body as T;
}
