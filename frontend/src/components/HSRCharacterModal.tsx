import { useEffect } from 'react';
import type { HSRCharacter } from '../api/types';
import {
  hsrElementColor,
  hsrRarityColor,
  hsrStatLabel,
  hsrHeadlineStat,
  hsrStatValue,
} from '../lib/hsr';

const STAT_ORDER = ['hp', 'atk', 'def', 'spd', 'critRate', 'critDamage'];
const SLOT_ORDER = ['head', 'hands', 'body', 'feet', 'sphere', 'rope'];

export function HSRCharacterModal({
  character,
  onClose,
}: {
  character: HSRCharacter;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const elem = hsrElementColor(character.element);
  const relics = [...character.relics].sort(
    (a, b) => SLOT_ORDER.indexOf(a.slot) - SLOT_ORDER.indexOf(b.slot),
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
          style={{ borderColor: `${elem}40` }}
        >
          {character.iconUrl && (
            <img
              src={character.iconUrl}
              alt=""
              className="h-16 w-16 rounded-lg ring-1 ring-white/15"
            />
          )}
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-white">{character.name}</h2>
            <p className="text-sm font-medium" style={{ color: elem }}>
              {character.path} · {character.element} · Lv.{character.level} · E{character.eidolon}
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
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            {/* light cone */}
            {character.lightConeName ? (
              <div className="flex items-center gap-3 rounded-lg border border-white/15 p-3">
                {character.lightConeIconUrl && (
                  <img
                    src={character.lightConeIconUrl}
                    alt=""
                    className="h-12 w-12 rounded object-cover object-top"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {character.lightConeName}
                  </p>
                  <p className="text-xs text-white/60">
                    S{character.lightConeSuperimpose} · Lv.{character.lightConeLevel}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center rounded-lg border border-white/10 p-3 text-sm text-white/40">
                No light cone
              </div>
            )}

            {/* headline stats */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-white/15 p-3 text-xs">
              {STAT_ORDER.map((k) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-white/50">{hsrStatLabel(k)}</span>
                  <span className="font-medium text-white">
                    {hsrHeadlineStat(k, character.stats[k] ?? null)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* relics */}
          {relics.length === 0 ? (
            <p className="text-sm text-white/40">No relics equipped.</p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relics.map((r) => (
                <div
                  key={r.id}
                  className="rounded-lg border border-white/15 p-3"
                  style={{ boxShadow: `inset 0 0 0 1px ${hsrRarityColor(r.rarity)}44` }}
                >
                  <div className="flex items-center gap-2">
                    {r.iconUrl && <img src={r.iconUrl} alt="" className="h-10 w-10 rounded" />}
                    <div className="min-w-0">
                      <p className="truncate text-[11px] text-white/60">
                        {hsrStatLabel(r.mainStat.key)}
                      </p>
                      <p className="text-sm font-bold" style={{ color: hsrRarityColor(r.rarity) }}>
                        {hsrStatValue(r.mainStat.value, r.mainStat.isPercent)}
                      </p>
                    </div>
                    <span className="ml-auto text-[10px] text-white/40">+{r.level}</span>
                  </div>
                  <p className="mt-1 truncate text-[10px] text-white/40">{r.setName}</p>
                  <ul className="mt-1.5 space-y-0.5">
                    {r.subStats.map((s, i) => (
                      <li key={i} className="flex justify-between text-[11px] text-white/60">
                        <span>{hsrStatLabel(s.key)}</span>
                        <span>{hsrStatValue(s.value, s.isPercent)}</span>
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
