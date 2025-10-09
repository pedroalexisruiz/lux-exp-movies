export class HttpError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
    public details?: unknown,
    options?: { cause?: unknown },
  ) {
    super(message, options || {});
    this.name = 'HttpError';
  }
}
