import { useState } from 'react';
import type { Game, LinkedAccount } from '../api/types';
import { CompletionRing } from './CompletionRing';
import { computeStats } from '../lib/stats';

interface Props {
  displayName: string | null;
  avatar: string | null;
  lastSyncedAt: string | null;
  games: Game[];
  accounts: LinkedAccount[];
  status: string;
  onSync: () => void;
  onLink: (steamId: string) => void;
  onSwitch: (id: string) => void;
}

export function ProfileHeader({
  displayName,
  avatar,
  lastSyncedAt,
  games,
  accounts,
  status,
  onSync,
  onLink,
  onSwitch,
}: Props) {
  const [showAdd, setShowAdd] = useState(false);
  const [steamId, setSteamId] = useState('');

  const { gameCount, hours, overall } = computeStats(games);
  const active = accounts.find((a) => a.isActive);

  return (
    <header className="border-b border-white/15 bg-black">
      <div className="mx-auto max-w-7xl px-6 py-5">
        <div className="flex flex-wrap items-center gap-4">
          {/* avatar wrapped in the overall-completion ring */}
          <div className="relative h-16 w-16 shrink-0">
            <div className="absolute inset-[5px] overflow-hidden rounded-full bg-white/10">
              {avatar ? (
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-2xl">🏆</div>
              )}
            </div>
            <div className="absolute inset-0">
              <CompletionRing percent={overall} size={64} fill={false} label={false} />
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {displayName ?? 'Trophy Wall'}
            </h1>
            <p className="text-sm text-white/50">
              {gameCount} games · {hours.toLocaleString()}h played · {overall}% overall
              {lastSyncedAt && ` · synced ${new Date(lastSyncedAt).toLocaleDateString()}`}
            </p>
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
            <input
              value={steamId}
              onChange={(e) => setSteamId(e.target.value)}
              placeholder="Steam ID (17-digit)"
              className="rounded border border-white/20 bg-black px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/60"
            />
            <button
              onClick={() => {
                onLink(steamId);
                setSteamId('');
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
