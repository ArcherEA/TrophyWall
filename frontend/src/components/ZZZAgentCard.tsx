import type { ZZZAgent } from '../api/types';
import { zzzElementColor, zzzRarityColor } from '../lib/zzz';

export function ZZZAgentCard({ agent, onClick }: { agent: ZZZAgent; onClick: () => void }) {
  const elem = zzzElementColor(agent.element);
  const border = agent.accentColor ?? zzzRarityColor(agent.rarity);

  return (
    <button
      onClick={onClick}
      className="group block overflow-hidden rounded-lg bg-neutral-900 text-left transition duration-200 hover:-translate-y-1"
      style={{ boxShadow: `inset 0 0 0 1.5px ${border}66` }}
    >
      <div className="relative aspect-square">
        {agent.iconUrl ? (
          <img
            src={agent.iconUrl}
            alt={agent.name}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center p-2 text-center text-xs text-white/70">
            {agent.name}
          </div>
        )}
        <span
          className="absolute right-1.5 top-1.5 rounded px-1 text-[10px] font-bold text-black"
          style={{ background: zzzRarityColor(agent.rarity) }}
        >
          {agent.rarity}
        </span>
        <span
          className="absolute left-1.5 top-1.5 h-3 w-3 rounded-full ring-1 ring-black/50"
          style={{ background: elem }}
        />
      </div>
      <div className="border-t border-white/10 px-2 py-1.5">
        <p className="truncate text-xs font-semibold text-white">{agent.name}</p>
        <p className="text-[11px] text-white/60">
          Lv.{agent.level} · M{agent.mindscape}
        </p>
      </div>
    </button>
  );
}
