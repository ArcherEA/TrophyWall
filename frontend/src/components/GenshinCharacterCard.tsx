import type { GenshinCharacter } from '../api/types';
import { elementColor, rarityColor } from '../lib/genshin';

export function GenshinCharacterCard({
  character,
  onClick,
}: {
  character: GenshinCharacter;
  onClick: () => void;
}) {
  const elem = elementColor(character.element);
  const border = rarityColor(character.rarity);

  return (
    <button
      onClick={onClick}
      className="group block overflow-hidden rounded-lg bg-neutral-900 text-left transition duration-200 hover:-translate-y-1"
      style={{ boxShadow: `inset 0 0 0 1.5px ${border}55` }}
    >
      {/* square portrait */}
      <div className="relative aspect-square">
        {character.iconUrl ? (
          <img
            src={character.iconUrl}
            alt={character.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-white/70">
            {character.name}
          </div>
        )}
        {/* element dot */}
        <span
          className="absolute right-1.5 top-1.5 h-3 w-3 rounded-full ring-1 ring-black/50"
          style={{ background: elem }}
        />
      </div>

      {/* footer: name + level (solid, below the portrait) */}
      <div className="border-t border-white/10 px-2 py-1.5">
        <p className="truncate text-xs font-semibold text-white">{character.name}</p>
        <p className="text-[11px] text-white/60">
          Lv.{character.level} · C{character.constellation}
        </p>
      </div>
    </button>
  );
}
