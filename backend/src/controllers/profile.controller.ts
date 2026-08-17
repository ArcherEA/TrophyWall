import type { Request, Response } from 'express';
import { profileService } from '../services/profile.service.js';

export async function getProfile(_req: Request, res: Response) {
  const profile = await profileService.getProfile();
  if (!profile) return res.status(404).json({ error: 'No Steam account linked' });
  res.json(profile);
}
