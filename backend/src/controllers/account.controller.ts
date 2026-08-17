import type { Request, Response } from 'express';
import { accountService } from '../services/account.service.js';

export async function linkAccount(req: Request, res: Response) {
  const { platform, externalId } = req.body;

  if (!externalId || typeof externalId !== 'string') {
    return res.status(400).json({ error: 'externalId (string) is required' });
  }

  const account =
    platform === 'GENSHIN' || platform === 'HSR'
      ? await accountService.linkHoyoAccount(platform, externalId)
      : await accountService.linkSteamAccount(externalId);

  res.status(201).json(account);
}

export async function listAccounts(_req: Request, res: Response) {
  res.json(await accountService.listAccounts());
}

export async function switchAccount(req: Request, res: Response) {
  const { linkedAccountId } = req.body;
  if (!linkedAccountId) return res.status(400).json({ error: 'linkedAccountId required' });
  res.json(await accountService.switchAccount(linkedAccountId));
}
