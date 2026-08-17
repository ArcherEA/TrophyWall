import { useEffect } from 'react';
import type { ZZZAgent } from '../api/types';
import { zzzElementColor, zzzRarityColor, zzzStatValue, ZZZ_SLOT_ORDER } from '../lib/zzz';

export function ZZZAgentModal({ agent, onClose }: { agent: ZZZAgent; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const elem = zzzElementColor(agent.element);
  const accent = agent.accentColor ?? zzzRarityColor(agent.rarity);
  const discs = [...agent.discs].sort(
    (a, b) => ZZZ_SLOT_ORDER.indexOf(a.slot) - ZZZ_SLOT_ORDER.indexOf(b.slot),
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-white/20 bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <header
          className="flex shrink-0 items-center gap-4 border-b p-4"
          style={{ borderColor: `${accent}55` }}
        >
          {agent.iconUrl && (
            <img src={agent.iconUrl} alt="" className="h-16 w-16 rounded-lg ring-1 ring-white/15" />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white">{agent.name}</h2>
            <p className="text-sm font-medium" style={{ color: elem }}>
              {[agent.rarity, agent.element, agent.profession].filter(Boolean).join(' · ')} · Lv.
              {agent.level} · M{agent.mindscape}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            ✕
          </button>
        </header>

        <div className="overflow-y-auto p-4">
          {/* W-Engine */}
          <div className="mb-4">
            {agent.wEngineName ? (
              <div
                className="flex items-start gap-3 rounded-lg border p-3"
                style={{ borderColor: `${zzzRarityColor(agent.wEngineRarity ?? 'A')}55` }}
              >
                {agent.wEngineIconUrl && (
                  <img
                    src={agent.wEngineIconUrl}
                    alt=""
                    className="h-12 w-12 rounded object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="truncate text-sm font-semibold text-white">{agent.wEngineName}</p>
                    {agent.wEngineStatLabel && (
                      <span className="shrink-0 rounded bg-white/10 px-1.5 py-0.5 text-[10px] text-white/70">
                        Base ATK · {agent.wEngineStatLabel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-white/60">
                    {agent.wEngineRarity} · Lv.{agent.wEngineLevel} · Phase {agent.wEnginePhase}
                  </p>
                  {agent.wEngineEffectName && (
                    <div className="mt-2 border-t border-white/10 pt-2">
                      <p className="text-[11px] font-semibold" style={{ color: accent }}>
                        {agent.wEngineEffectName}
                      </p>
                      {agent.wEngineEffectDesc && (
                        <p className="mt-0.5 text-[11px] leading-snug text-white/55">
                          {agent.wEngineEffectDesc}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-white/10 p-3 text-sm text-white/40">
                No W-Engine equipped
              </div>
            )}
          </div>

          {/* drive discs */}
          {discs.length === 0 ? (
            <p className="text-sm text-white/40">No drive discs equipped.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {discs.map((d) => (
                <div
                  key={d.id}
                  className="rounded-lg border border-white/15 p-3"
                  style={{ boxShadow: `inset 0 0 0 1px ${zzzRarityColor(d.rarity)}44` }}
                >
                  <div className="flex items-center gap-2">
                    {d.iconUrl && <img src={d.iconUrl} alt="" className="h-10 w-10 rounded" />}
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-white/60">{d.mainStat.label}</p>
                      <p className="text-sm font-bold" style={{ color: zzzRarityColor(d.rarity) }}>
                        {zzzStatValue(d.mainStat.value, d.mainStat.isPercent)}
                      </p>
                    </div>
                    <span className="ml-auto text-[10px] text-white/40">
                      #{d.slot} · +{d.level}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-white/40">{d.setName}</p>
                  <ul className="mt-1.5 space-y-0.5">
                    {d.subStats.map((s, i) => (
                      <li key={i} className="flex justify-between text-[11px] text-white/60">
                        <span>{s.label}</span>
                        <span>{zzzStatValue(s.value, s.isPercent)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
