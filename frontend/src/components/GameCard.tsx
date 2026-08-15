import type { Game } from '../api/types';

export function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  const cover = game.images.libraryCover ?? game.images.header ?? game.images.capsule;
  const pct = game.achievements.percent;
  const hours = Math.round(game.playtimeForever / 60);
  const isPlatinum = pct === 100;

  return (
    <button
      onClick={onClick}
      className="group relative aspect-[2/3] overflow-hidden rounded-lg bg-neutral-800 ring-1 ring-white/10 transition hover:scale-[1.03] hover:ring-white/40"
    >
      {cover ? (
        <img
          src={cover}
          alt={game.name}
          loading="lazy"
          onError={(e) => {
            const img = e.currentTarget;
            if (game.images.header && img.src !== game.images.header) img.src = game.images.header;
          }}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full items-center justify-center p-2 text-center text-sm text-neutral-300">
          {game.name}
        </div>
      )}

      {/* bottom gradient + title */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3 pt-10 text-left">
        <p className="truncate text-sm font-medium text-white">{game.name}</p>
        <p className="text-xs text-neutral-400">{hours}h played</p>
      </div>

      {/* completion badge */}
      {pct !== null && (
        <div
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-xs font-bold ring-1 ${
            isPlatinum
              ? 'bg-amber-400/90 text-black ring-amber-200'
              : 'bg-black/70 text-white ring-white/20'
          }`}
        >
          {pct}%
        </div>
      )}
    </button>
  );
}