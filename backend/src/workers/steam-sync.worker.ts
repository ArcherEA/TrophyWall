// src/workers/steam-sync.worker.ts
import { Worker } from 'bullmq';
import { createBullConnection, type SteamSyncJob } from '../lib/queue.js';
import { steamSyncService } from '../services/steam-sync.service.js';

const worker = new Worker<SteamSyncJob>(
  'steam-sync',
  async (job) => {
    const { linkedAccountId } = job.data;
    console.log(`[worker] syncing account ${linkedAccountId} (job ${job.id})`);

    return steamSyncService.syncAccount(linkedAccountId, (done, total) => {
      job.updateProgress({ done, total });   // stored in Redis, pollable
    });
  },
  {
    connection: createBullConnection(),
    concurrency: 1,   // one account at a time; games inside are already sequential
  },
);

worker.on('completed', (job, result) => console.log(`[worker] done ${job.id}`, result));
worker.on('failed', (job, err) => console.error(`[worker] failed ${job?.id}`, err));

console.log('[worker] steam-sync worker started');