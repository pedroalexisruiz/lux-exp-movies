import type { ErrorRequestHandler } from 'express';
import { DomainException } from '../../domain/exception/DomainException';

export function mapStatus(e: DomainException): number {
  switch (e.type) {
    case 'Unauthorized':
      return 401;
    case 'GenreNotFound':
      return 404;
    case 'RateLimited':
      return 429;
    case 'ExternalServiceUnavailable':
      return 503;
    case 'Network':
      return 502;
    default:
      return 500;
  }
}

export const exceptionMiddleware: ErrorRequestHandler = (err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }
  if (err instanceof DomainException) {
    return res.status(mapStatus(err)).json({
      ok: false,
      code: err.type,
      message: err.message ?? err.type,
      details: err.details,
    });
  }

  const message = err instanceof Error ? err.message : 'Internal Server Error';
  return res.status(500).json({ ok: false, message });
};
