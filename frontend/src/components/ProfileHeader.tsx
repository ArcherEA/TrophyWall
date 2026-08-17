import { useState } from 'react';
import type { LinkedAccount, Platform } from '../api/types';
import { CompletionRing } from './CompletionRing';

interface Props {
  displayName: string | null;
  avatar: string | null;
  subtitle: string;
  overall?: number; // completion ring (Steam only); omit for platforms without a % metric
  accounts: LinkedAccount[];
  status: string;
  onSync: () => void;
  onLink: (platform: Platform, externalId: string) => void;
  onSwitch: (id: string) => void;
}

export function ProfileHeader({
  displayName,
  avatar,
  subtitle,
  overall,
  accounts,
  status,
  onSync,
  onLink,
  onSwitch,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [platform, setPlatform] = useState<Platform>('STEAM');
  const [externalId, setExternalId] = useState('');
  const active = accounts.find((a) => a.isActive);

  return (
    <header className="border-b border-white/15 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* avatar (wrapped in the completion ring when there's a % metric) */}
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-[5px] overflow-hidden rounded-full bg-white/10">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">🏆</div>
              )}
            </div>
            {overall !== undefined ? (
              <div className="absolute inset-0">
                <CompletionRing percent={overall} size={64} fill={false} label={false} />
              </div>
            ) : (
              <div className="pointer-events-none absolute inset-0 rounded-full ring-1 ring-white/20" />
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {displayName ?? 'Trophy Wall'}
            </h1>
            <p className="text-sm text-white/50">{subtitle}</p>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {accounts.length > 1 && (
              <select
                value={active?.id ?? ''}
                onChange={(e) => onSwitch(e.target.value)}
                className="rounded border border-white/20 bg-black px-2 py-1.5 text-sm text-white outline-none focus:border-white/60"
              >
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.platform === 'GENSHIN'
                      ? '⚔ '
                      : a.platform === 'HSR'
                        ? '🚂 '
                        : a.platform === 'ZZZ'
                          ? '🌀 '
                          : '🎮 '}
                    {a.displayName ?? a.externalId}
                  </option>
                ))}
              </select>
            )}
            <button
              onClick={onSync}
              className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/15"
            >
              Sync
            </button>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/15"
            >
              ＋ Add account
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value as Platform)}
              className="rounded border border-white/20 bg-black px-2 py-1.5 text-sm text-white outline-none focus:border-white/60"
            >
              <option value="STEAM">Steam</option>
              <option value="GENSHIN">Genshin</option>
              <option value="HSR">Star Rail</option>
              <option value="ZZZ">Zenless</option>
            </select>
            <input
              value={externalId}
              onChange={(e) => setExternalId(e.target.value)}
              placeholder={platform === 'STEAM' ? 'Steam ID (17-digit)' : 'UID (8–10 digits)'}
              className="rounded border border-white/20 bg-black px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/60"
            />
            <button
              onClick={() => {
                onLink(platform, externalId);
                setExternalId('');
                setShowAdd(false);
              }}
              className="rounded border border-white/20 bg-white/5 px-3 py-1.5 text-sm text-white transition hover:bg-white/15"
            >
              Link
            </button>
          </div>
        )}

        {status && <p className="mt-2 text-sm text-white/60">{status}</p>}
      </div>
    </header>
  );
}
