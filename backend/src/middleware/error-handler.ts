import { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  console.error('[Unhandled Error]', err);

  // Defense in depth: Specifically catch the 'Gate {id} not found' error from the staff query
  // just in case validate-request misses it.
  if (err instanceof Error && err.message && err.message.startsWith('Gate ') && err.message.includes('not found')) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Return generic error, never leaking stack traces or LLM context
  res.status(500).json({ error: 'Internal Server Error' });
}
