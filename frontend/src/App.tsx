import { useEffect, useState } from 'react';
import { api } from './api/client';
import type { Profile, LinkedAccount } from './api/types';
import { GameWall } from './components/GameWall';
import { StatsBar } from './components/StatsBar';
import { ProfileHeader } from './components/ProfileHeader';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [status, setStatus] = useState('');

  async function loadAccounts() {
    try { setAccounts(await api.listAccounts()); } catch { /* accounts are optional on first load */ }
  }

  async function loadProfile() {
    try {
      setProfile(await api.getProfile());
    } catch (e) {
      setProfile(null);
      setStatus(`profile: ${(e as Error).message}`);
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect -- state is set after await, not synchronously
  useEffect(() => { loadAccounts(); loadProfile(); }, []);

  async function handleSwitch(id: string) {
    await api.switchAccount(id);
    await loadAccounts();
    await loadProfile();
  }

  async function handleLink(steamId: string) {
    if (!steamId) return;
    setStatus('linking…');
    try {
      await api.linkAccount(steamId);
      setStatus('linked');
      await loadAccounts();
      await loadProfile();
    } catch (e) {
      setStatus(`error: ${(e as Error).message}`);
    }
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
            if (s.state === 'completed') { loadProfile(); loadAccounts(); }
          }
        } catch (e) {
          clearInterval(poll);
          setStatus(`poll: ${(e as Error).message}`);
        }
      }, 1000);
    } catch (e) {
      setStatus(`error: ${(e as Error).message}`);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader
        displayName={profile?.account.displayName ?? null}
        avatar={profile?.account.avatar ?? null}
        lastSyncedAt={profile?.account.lastSyncedAt ?? null}
        games={profile?.games ?? []}
        accounts={accounts}
        status={status}
        onSync={handleSync}
        onLink={handleLink}
        onSwitch={handleSwitch}
      />

      <main className="mx-auto max-w-7xl p-6">
        {profile ? (
          profile.games.length > 0 ? (
            <>
              <StatsBar games={profile.games} />
              <GameWall games={profile.games} />
            </>
          ) : (
            <p className="text-white/50">No games yet — add your Steam account and hit Sync.</p>
          )
        ) : (
          <p className="text-white/50">No account linked yet — click “＋ Add account” above to get started.</p>
        )}
      </main>
    </div>
  );
}
