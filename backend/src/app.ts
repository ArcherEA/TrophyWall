import express from 'express';
import cors from 'cors';
import { pinoHttp } from 'pino-http';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { logger } from './lib/logger.js';
import { config } from './config/env.js';

export function createApp() {
  const app = express();

  // request logging (skip the noisy health check)
  app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));
  // restrict CORS to the configured origin(s) in prod; allow all when unset (dev)
  app.use(cors({ origin: config.corsOrigin ? config.corsOrigin.split(',') : true }));
  app.use(express.json());

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api', routes);
  app.use(errorHandler);

  return app;
}
