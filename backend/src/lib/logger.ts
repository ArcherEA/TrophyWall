import { pino } from 'pino';

const env = process.env.NODE_ENV ?? 'development';
// pretty, colorized output in dev; structured JSON in prod (and quiet in tests)
const usePretty = env !== 'production' && env !== 'test';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (env === 'production' ? 'info' : 'debug'),
  ...(usePretty
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
});
