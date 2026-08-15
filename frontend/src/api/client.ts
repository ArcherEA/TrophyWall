import type { Profile, LinkedAccount } from './types';

const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`${path} → ${res.status}`);
  return res.json();
}

export interface SyncStatus {
  id: string;
  state: string;                                   // waiting | active | completed | failed
  progress: { done: number; total: number } | number | null;
  result?: { gamesSynced: number; gamesTotal: number };
  failedReason?: string;
}

export const api = {
  linkAccount: (steamId: string) => post<{ id: string }>('/accounts/link', { steamId }),
  startSync: () => post<{ jobId: string; status: string }>('/sync/steam', {}),
  getSyncStatus: (jobId: string) => get<SyncStatus>(`/sync/steam/${jobId}`),
  getProfile: () => get<Profile>('/profile'),
  listAccounts: () => get<LinkedAccount[]>('/accounts'),
  switchAccount: (linkedAccountId: string) =>
  post<LinkedAccount>('/accounts/switch', { linkedAccountId }),   
};