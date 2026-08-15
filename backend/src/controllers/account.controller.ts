import type { Request,Response } from "express";
import { accountService } from '../services/account.service.js'
import { error } from "node:console";

export async function linkAccount(req: Request,res: Response){
    const {steamId} = req.body;

    if (!steamId || typeof steamId !== 'string') {
        return res.status(400).json({error:'steamId (string) is required'});

    }

    const account = await accountService.linkSteamAccount(steamId);
    res.status(201).json(account);
}

export async function listAccounts(_req: Request, res: Response) {
  res.json(await accountService.listSteamAccounts());
}

export async function switchAccount(req: Request, res: Response) {
  const { linkedAccountId } = req.body;
  if (!linkedAccountId) return res.status(400).json({ error: 'linkedAccountId required' });
  res.json(await accountService.switchSteamAccount(linkedAccountId));
}