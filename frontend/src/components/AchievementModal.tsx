import { useEffect } from 'react';
import type { Game } from '../api/types';

export function AchievementModal({ game, onClose }: { game: Game; onClose: () => void }) {
  const { unlocked, total, items } = game.achievements;

  // close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg border border-white/20 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* fixed header (its own row, outside the scroll area) */}
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

        {/* only this body scrolls → scrollbar stays inside, below the header */}
        {items.length === 0 ? (
          <p className="p-6 text-white/60">No achievements for this game.</p>
        ) : (
          <div className="overflow-y-auto p-4">
            <div className="grid grid-cols-6 gap-3 sm:grid-cols-8">
              {items.map((a) => (
                <div
                  key={a.apiName}
                  title={`${a.displayName}${a.description ? ' — ' + a.description : ''}`}
                  className="relative"
                >
                  <img
                    src={a.icon ?? ''}
                    alt={a.displayName}
                    className={`aspect-square w-full rounded ${a.unlocked ? '' : 'opacity-40'}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
