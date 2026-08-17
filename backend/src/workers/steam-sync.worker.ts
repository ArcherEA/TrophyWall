// src/workers/steam-sync.worker.ts
import { Worker } from 'bullmq';
import { createBullConnection, type SteamSyncJob } from '../lib/queue.js';
import { dispatchSync } from '../services/sync-dispatch.js';
import { logger } from '../lib/logger.js';

const log = logger.child({ worker: 'steam-sync' });

const worker = new Worker<SteamSyncJob>(
  'steam-sync',
  async (job) => {
    const { linkedAccountId } = job.data;
    log.info({ jobId: job.id, linkedAccountId }, 'sync starting');

    return dispatchSync(linkedAccountId, (done, total) => {
      job.updateProgress({ done, total }); // stored in Redis, pollable
    });
  },
  {
    connection: createBullConnection(),
    concurrency: 1, // one account at a time; games inside are already sequential
  },
);

worker.on('completed', (job, result) => log.info({ jobId: job.id, result }, 'sync completed'));
worker.on('failed', (job, err) => log.error({ jobId: job?.id, err }, 'sync failed'));

log.info('steam-sync worker started');
