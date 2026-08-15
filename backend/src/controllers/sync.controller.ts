import type { Request, Response } from "express";
import { steamSyncService } from "../services/steam-sync.service.js";
import { steamSyncQueue } from '../lib/queue.js';
import { accountService } from "../services/account.service.js";

export async function syncSteam(req: Request, res: Response) {
    const account = await accountService.getSteamAccountForCurrentUser();
    if (!account) return res.status(404).json({ error: 'No Steam account linked' });
    // const { linkedAccountId } = req.body;
    // if ( !linkedAccountId || typeof linkedAccountId !== 'string' ) {
    //     return res.status(400).json({
    //         error: 'linkedAccountId (string) is required'
    //     });
    // }

    const job = await steamSyncQueue.add(
        'sync-account', 
        { linkedAccountId: account.id  }, 
        {
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        });
    res.status(202).json({ jobId: job.id, status: 'queued' }); // 202 Accepted
}

export async function syncStatus(req: Request, res: Response) {
    const jobId = req.params.jobId;
    if (typeof jobId !== 'string') {
        return res.status(400).json({ error: 'invalid jobId' });
    }
    const job = await steamSyncQueue.getJob(jobId);
    if (!job) return res.status(404).json({ error: 'job not found' });

    res.json({
        id: job.id,
        state: await job.getState(),      // waiting | active | completed | failed
        progress: job.progress,           // { done, total }
        result: job.returnvalue,          // { gamesSynced, gamesTotal } when done
        failedReason: job.failedReason,
    });
}