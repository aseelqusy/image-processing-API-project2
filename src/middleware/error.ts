import type { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const anyErr = err as { message?: string; status?: number };
  const status = anyErr?.status ?? 500;
  const message = anyErr?.message ?? 'Internal Server Error';
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
}
