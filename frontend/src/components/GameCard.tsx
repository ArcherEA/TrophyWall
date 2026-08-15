import type { Game } from '../api/types';
import { CompletionRing } from './CompletionRing';

export function GameCard({ game, onClick }: { game: Game; onClick: () => void }) {
  const cover = game.images.libraryCover ?? game.images.header ?? game.images.capsule;
  const pct = game.achievements.percent;
  const hours = Math.round(game.playtimeForever / 60);
  const isPlatinum = pct === 100;

  return (
    <button
      onClick={onClick}
      className={`group relative aspect-[2/3] overflow-hidden rounded-md bg-black transition duration-200 hover:-translate-y-1 ${
        isPlatinum ? 'platinum' : 'ring-1 ring-white/15 hover:ring-2 hover:ring-white/80'
      }`}
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
        <div className="flex h-full items-center justify-center p-2 text-center text-sm font-medium text-white">
          {game.name}
        </div>
      )}

      {/* bottom gradient + title (stronger gradient = readable text) */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/75 to-transparent p-3 pt-14 text-left">
        <p className="truncate text-sm font-semibold text-white drop-shadow">{game.name}</p>
        <p className="text-xs font-medium text-white/70">{hours}h played</p>
      </div>

      {/* completion ring */}
      {pct !== null && (
        <div className="absolute right-2 top-2 drop-shadow-lg">
          <CompletionRing percent={pct} />
        </div>
      )}
    </button>
  );
}
