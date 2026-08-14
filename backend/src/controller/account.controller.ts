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