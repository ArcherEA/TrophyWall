import { useEffect, useState } from 'react';
import { api } from './api/client';
import type { Profile, LinkedAccount, Platform } from './api/types';
import { isGenshinProfile, isSteamProfile, isHSRProfile, isZZZProfile } from './api/types';
import { GameWall } from './components/GameWall';
import { StatsBar } from './components/StatsBar';
import { GenshinShowcase } from './components/GenshinShowcase';
import { HSRShowcase } from './components/HSRShowcase';
import { ZZZShowcase } from './components/ZZZShowcase';
import { ProfileHeader } from './components/ProfileHeader';
import { computeStats } from './lib/stats';

export default function App() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [accounts, setAccounts] = useState<LinkedAccount[]>([]);
  const [status, setStatus] = useState('');

  async function loadAccounts() {
    try {
      setAccounts(await api.listAccounts());
    } catch {
      /* accounts are optional on first load */
    }
  }

  async function loadProfile() {
    try {
      setProfile(await api.getProfile());
    } catch (e) {
      setProfile(null);
      setStatus(`profile: ${(e as Error).message}`);
    }
  }

  // initial data load on mount — setState runs after await (async), not synchronously
  useEffect(() => {
    loadAccounts(); // eslint-disable-line react-hooks/set-state-in-effect
    loadProfile();
  }, []);

  async function handleSwitch(id: string) {
    await api.switchAccount(id);
    await loadAccounts();
    await loadProfile();
  }

  async function handleLink(platform: Platform, externalId: string) {
    if (!externalId) return;
    setStatus('linking…');
    try {
      await api.linkAccount(platform, externalId);
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
          const p =
            s.progress && typeof s.progress === 'object'
              ? ` ${s.progress.done}/${s.progress.total}`
              : '';
          setStatus(`sync: ${s.state}${p}`);
          if (s.state === 'completed' || s.state === 'failed') {
            clearInterval(poll);
            if (s.state === 'completed') {
              loadProfile();
              loadAccounts();
            }
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

  // per-platform header subtitle + optional completion ring
  let subtitle = '';
  let overall: number | undefined;
  if (profile && isSteamProfile(profile)) {
    const s = computeStats(profile.games);
    overall = s.overall;
    subtitle = `${s.gameCount} games · ${s.hours.toLocaleString()}h played · ${s.overall}% overall`;
  } else if (
    profile &&
    (isGenshinProfile(profile) || isHSRProfile(profile) || isZZZProfile(profile))
  ) {
    const noun = isZZZProfile(profile) ? 'agents' : 'characters';
    subtitle = `${profile.characters.length} ${noun}`;
  }
  if (profile?.account.lastSyncedAt) {
    subtitle += ` · synced ${new Date(profile.account.lastSyncedAt).toLocaleDateString()}`;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <ProfileHeader
        displayName={profile?.account.displayName ?? null}
        avatar={profile?.account.avatar ?? null}
        subtitle={subtitle}
        overall={overall}
        accounts={accounts}
        status={status}
        onSync={handleSync}
        onLink={handleLink}
        onSwitch={handleSwitch}
      />

      <main className="mx-auto max-w-7xl p-6">
        {!profile ? (
          <p className="text-white/50">
            No account linked yet — click “＋ Add account” above to get started.
          </p>
        ) : isGenshinProfile(profile) ? (
          <GenshinShowcase characters={profile.characters} />
        ) : isHSRProfile(profile) ? (
          <HSRShowcase characters={profile.characters} />
        ) : isZZZProfile(profile) ? (
          <ZZZShowcase characters={profile.characters} />
        ) : profile.games.length > 0 ? (
          <>
            <StatsBar games={profile.games} />
            <GameWall games={profile.games} />
          </>
        ) : (
          <p className="text-white/50">No games yet — add your Steam account and hit Sync.</p>
        )}
      </main>
    </div>
  );
}
