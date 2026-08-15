import { useEffect, useState } from 'react';
import { api } from './api/client';
import type { Profile, LinkedAccount } from './api/types';
import { GameWall } from './components/GameWall';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [steamId, setSteamId] = useState('');
  const [status, setStatus] = useState('');

  async function loadAccounts() {
    try { setAccounts(await api.listAccounts()); } catch {}
  }
  useEffect(() => { loadAccounts(); loadProfile(); }, []);

  async function handleSwitch(id: string) {
    await api.switchAccount(id);
    await loadAccounts();   // refresh which is active
    await loadProfile();    // re-render wall for the newly active account
  }

  async function loadProfile() {
    try {
      setProfile(await api.getProfile());
    } catch (e) {
      setStatus(`profile: ${(e as Error).message}`);
    }
  }
  useEffect(() => { loadProfile(); }, []);

  async function handleLink() {
    setStatus('linking…');
    try { await api.linkAccount(steamId); setStatus('linked'); }
    catch (e) { setStatus(`error: ${(e as Error).message}`); }
  }

  async function handleSync() {
    setStatus('starting sync…');
    try {
      const { jobId } = await api.startSync();
      const poll = setInterval(async () => {
        try {
          const s = await api.getSyncStatus(jobId);
          const p = s.progress && typeof s.progress === 'object'
            ? ` ${s.progress.done}/${s.progress.total}` : '';
          setStatus(`sync: ${s.state}${p}`);
          if (s.state === 'completed' || s.state === 'failed') {
            clearInterval(poll);
            if (s.state === 'completed') loadProfile();   // refresh the wall
          }
        } catch (e) { clearInterval(poll); setStatus(`poll: ${(e as Error).message}`); }
      }, 1000);
    } catch (e) { setStatus(`error: ${(e as Error).message}`); }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* dev bar */}
      <header className="border-b border-white/10 bg-neutral-900/60 p-3">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2">
          <h1 className="mr-4 font-semibold">🏆 Trophy Wall</h1>
          {accounts.length > 1 && (
            <select
              value={accounts.find((a) => a.isActive)?.id ?? ''}
              onChange={(e) => handleSwitch(e.target.value)}
              className="rounded bg-neutral-800 px-2 py-1 text-sm ring-1 ring-white/10"
            >
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName ?? a.externalId}
                </option>
              ))}
            </select>
          )}
          <input
            value={steamId}
            onChange={(e) => setSteamId(e.target.value)}
            placeholder="Steam ID (17-digit)"
            className="rounded bg-neutral-800 px-2 py-1 text-sm ring-1 ring-white/10"
          />
          <button onClick={handleLink} className="rounded bg-neutral-700 px-3 py-1 text-sm hover:bg-neutral-600">Link</button>
          <button onClick={handleSync} className="rounded bg-neutral-700 px-3 py-1 text-sm hover:bg-neutral-600">Sync</button>
          <span className="text-sm text-neutral-400">{status}</span>
          
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {profile ? (
          profile.games.length > 0
            ? <GameWall games={profile.games} />
            : <p className="text-neutral-400">No games yet — link your Steam ID and hit Sync.</p>
        ) : (
          <p className="text-neutral-400">Loading…</p>
        )}
      </main>
    </div>
  );
}