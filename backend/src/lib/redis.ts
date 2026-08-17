import { Redis } from 'ioredis';
import { config } from '../config/env.js';
import { logger } from './logger.js';

export const redis = new Redis(config.redisUrl);

redis.on('error', (err) => logger.error({ err }, 'redis connection error'));
