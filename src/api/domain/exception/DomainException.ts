export type DomainErrorType =
  | 'Unauthorized'
  | 'GenreNotFound'
  | 'RateLimited'
  | 'ExternalServiceUnavailable'
  | 'InvalidArgument'
  | 'Network';

export class DomainException extends Error {
  readonly _tag = 'DomainException';
  readonly type: DomainErrorType;
  readonly details?: unknown;

  constructor(type: DomainErrorType, message?: string, details?: unknown) {
    super(message ?? type);
    this.type = type;
    this.details = details;
    this.name = new.target.name;
  }
}

export class GenreNotFound extends DomainException {
  constructor(message = 'Genre not found', details?: unknown) {
    super('GenreNotFound', message, details);
  }
}

export class ExternalServiceUnavailable extends DomainException {
  constructor(message = 'External service unavailable', details?: unknown) {
    super('ExternalServiceUnavailable', message, details);
  }
}

export class RateLimited extends DomainException {
  constructor(message = 'Rate limited', details?: unknown) {
    super('RateLimited', message, details);
  }
}

export class Unauthorized extends DomainException {
  constructor(message = 'Unauthorized', details?: unknown) {
    super('Unauthorized', message, details);
  }
}

export class InvalidArgument extends DomainException {
  constructor(message = 'InvalidArgument', details?: unknown) {
    super('InvalidArgument', message, details);
  }
}

export class NetworkError extends DomainException {
  constructor(message = 'Network error', details?: unknown) {
    super('Network', message, details);
  }
}
