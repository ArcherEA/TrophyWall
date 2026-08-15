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
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-neutral-900 ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="sticky top-0 flex items-center justify-between gap-4 border-b border-white/10 bg-neutral-900/95 p-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-white">{game.name}</h2>
            <p className="text-sm text-neutral-400">{unlocked} / {total} unlocked</p>
          </div>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-neutral-400 hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </header>

        {items.length === 0 ? (
          <p className="p-6 text-neutral-400">No achievements for this game.</p>
        ) : (
          <div className="grid grid-cols-6 gap-3 p-4 sm:grid-cols-8">
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
        )}
      </div>
    </div>
  );
}