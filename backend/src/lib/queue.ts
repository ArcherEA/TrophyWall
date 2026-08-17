// src/lib/queue.ts
import { Queue } from 'bullmq';
import { Redis } from 'ioredis';
import { config } from '../config/env.js';

// BullMQ requires maxRetriesPerRequest: null on its connections
export function createBullConnection() {
  return new Redis(config.redisUrl, { maxRetriesPerRequest: null });
}

export interface SteamSyncJob {
  linkedAccountId: string;
}

export const steamSyncQueue = new Queue<SteamSyncJob>('steam-sync', {
  connection: createBullConnection(),
});
