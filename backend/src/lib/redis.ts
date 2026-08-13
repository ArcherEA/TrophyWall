import { Redis } from 'ioredis';
import { config } from '../config/env.js';

export const redis = new Redis(config.redisUrl);

redis.on('error', (err)=>console.error(`[redis] connection error`,err));
