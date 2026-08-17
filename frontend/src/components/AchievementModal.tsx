import { useEffect, useMemo, useState } from 'react';
import type { Game } from '../api/types';
import { getRarity, rarityMeta } from '../lib/rarity';

type Filter = 'all' | 'unlocked' | 'locked';

export function AchievementModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const { unlocked, total, items } = game.achievements;
  const [filter, setFilter] = useState<Filter>('all');

  const pct = total ? Math.round((unlocked / total) * 100) : 0;
  const isPerfect = total > 0 && unlocked === total;

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const sorted = useMemo(
    () => [...items].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)),
    [items],
  );

  const shown = useMemo(() => {
    if (filter === 'unlocked') return sorted.filter((a) => a.unlocked);
    if (filter === 'locked') return sorted.filter((a) => !a.unlocked);
    return sorted;
  }, [sorted, filter]);

  const tabs: { key: Filter; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: total },
    { key: 'unlocked', label: 'Unlocked', count: unlocked },
    { key: 'locked', label: 'Locked', count: total - unlocked },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/20 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* fixed header */}
        <header className="shrink-0 border-b border-white/15 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">{game.name}</h2>
              <p className="text-sm text-white/60">
                {unlocked} / {total} unlocked · {pct}%
              </p>
            </div>
            <button
              onClick={onClose}
              className="rounded px-2 py-1 text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* progress bar */}
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: isPerfect ? '#fbbf24' : '#fff' }}
            />
          </div>

          {/* filter tabs */}
          <div className="mt-3 flex gap-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setFilter(t.key)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  filter === t.key ? 'bg-white/15 text-white' : 'text-white/50 hover:text-white/80'
                }`}
              >
                {t.label} <span className="opacity-60">{t.count}</span>
              </button>
            ))}
          </div>
        </header>

        {/* the display case (only this scrolls) */}
        {items.length === 0 ? (
          <p className="p-6 text-white/60">No achievements for this game.</p>
        ) : (
          <div className="trophy-case overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {shown.map((a) => {
                const hiddenLocked = a.hidden === 1 && !a.unlocked;
                const rarity = getRarity(a.globalPercent);
                const rarityClass =
                  a.unlocked && rarity && rarity !== 'common' ? `rarity-${rarity}` : '';
                return (
                  <div
                    key={a.apiName}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-lg border p-3 transition ${
                      a.unlocked
                        ? 'trophy-card border-white/15 hover:-translate-y-0.5'
                        : 'trophy-locked border-white/5'
                    } ${rarityClass}`}
                  >
                    <img
                      src={a.icon ?? ''}
                      alt={a.displayName}
                      className={`h-14 w-14 shrink-0 rounded ${a.unlocked ? '' : 'opacity-40 blur-[0.5px]'}`}
                    />
                    <div className="min-w-0">
                      <p
                        className={`truncate text-sm font-semibold ${a.unlocked ? 'text-white' : 'text-white/45'}`}
                      >
                        {a.displayName}
                      </p>
                      <p className="line-clamp-2 text-xs text-white/45">
                        {hiddenLocked ? 'Hidden achievement' : a.description}
                      </p>
                      {rarity && a.globalPercent != null && (
                        <p
                          className={`mt-0.5 text-[11px] font-semibold ${rarityMeta[rarity].text}`}
                        >
                          {rarityMeta[rarity].label} · {a.globalPercent.toFixed(1)}%
                        </p>
                      )}
                      {a.unlocked && a.unlockedAt && (
                        <p className="mt-0.5 text-[11px] text-white/40">
                          Unlocked {new Date(a.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                      {!a.unlocked && <p className="mt-0.5 text-[11px] text-white/30">🔒 Locked</p>}
                    </div>
                    {a.unlocked && <span className="shine" />}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
