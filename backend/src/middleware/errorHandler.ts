import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  logger.error({ err }, 'request error');
  const message = err instanceof Error ? err.message : 'Internal Server Error';
  res.status(500).json({ error: message });
}
