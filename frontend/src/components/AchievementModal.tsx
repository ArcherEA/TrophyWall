import { useEffect, useMemo } from 'react';
import type { Game } from '../api/types';

export function AchievementModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const { unlocked, total, items } = game.achievements;

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // unlocked trophies first
  const sorted = useMemo(
    () => [...items].sort((a, b) => Number(b.unlocked) - Number(a.unlocked)),
    [items],
  );

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
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-white/15 p-4">
          <div>
            <h2 className="text-lg font-bold text-white">{game.name}</h2>
            <p className="text-sm text-white/60">{unlocked} / {total} unlocked</p>
          </div>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </header>

        {/* the display case (only this scrolls) */}
        {items.length === 0 ? (
          <p className="p-6 text-white/60">No achievements for this game.</p>
        ) : (
          <div className="trophy-case overflow-y-auto p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {sorted.map((a) => {
                const hiddenLocked = a.hidden === 1 && !a.unlocked;
                return (
                  <div
                    key={a.apiName}
                    className={`group relative flex items-center gap-3 overflow-hidden rounded-lg border p-3 transition ${
                      a.unlocked
                        ? 'trophy-card border-white/15 hover:-translate-y-0.5'
                        : 'border-white/5 bg-white/[0.02]'
                    }`}
                  >
                    <img
                      src={a.icon ?? ''}
                      alt={a.displayName}
                      className={`h-14 w-14 shrink-0 rounded ${a.unlocked ? '' : 'opacity-40'}`}
                    />
                    <div className="min-w-0">
                      <p className={`truncate text-sm font-semibold ${a.unlocked ? 'text-white' : 'text-white/50'}`}>
                        {a.displayName}
                      </p>
                      <p className="line-clamp-2 text-xs text-white/50">
                        {hiddenLocked ? 'Hidden achievement' : a.description}
                      </p>
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
