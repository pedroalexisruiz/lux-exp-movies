import {
  ExternalServiceUnavailable,
  GenreNotFound,
  NetworkError,
  RateLimited,
  Unauthorized,
} from '../../domain/exception/DomainException';
import { isHttpError } from '../http/customFetch';

export const ErrorFactory = {
  fromErrorToDomainException(e: unknown, ctx?: { genreId?: number }): never {
    if (isHttpError(e)) {
      if (e.status === 401) throw new Unauthorized();
      if (e.status === 404)
        throw new GenreNotFound(`Genre ${ctx?.genreId} not found`, ctx?.genreId);
      if (e.status === 429) throw new RateLimited();
      if (e.status >= 500) throw new ExternalServiceUnavailable();
    }
    if (e instanceof TypeError) throw new NetworkError();
    throw e instanceof Error ? e : new Error('Unknown error');
  },
};
