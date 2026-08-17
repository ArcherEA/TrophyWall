import { useEffect } from 'react';
import type { GenshinCharacter } from '../api/types';
import {
  elementColor,
  rarityColor,
  formatHeadlineStat,
  formatStat,
  STAT_LABELS,
} from '../lib/genshin';

const STAT_ORDER = [
  'hp',
  'atk',
  'def',
  'critRate',
  'critDamage',
  'energyRecharge',
  'elementalMastery',
  'elementalDamage',
];
const SLOT_ORDER = ['flower', 'plume', 'sands', 'goblet', 'circlet'];

export function GenshinCharacterModal({
  character,
  onClose,
}: {
  character: GenshinCharacter;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const elem = elementColor(character.element);
  const artifacts = [...character.artifacts].sort(
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
              {character.element} · Lv.{character.level} · C{character.constellation}
            </p>
            <p className="text-xs text-white/50">
              Talents {character.talentNormal}/{character.talentSkill}/{character.talentBurst}
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
            {/* weapon */}
            <div className="flex items-center gap-3 rounded-lg border border-white/15 p-3">
              {character.weaponIconUrl && (
                <img src={character.weaponIconUrl} alt="" className="h-12 w-12 rounded" />
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{character.weaponName}</p>
                <p className="text-xs text-white/60">
                  R{character.weaponRefinement} · Lv.{character.weaponLevel}
                </p>
              </div>
            </div>

            {/* headline stats */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-lg border border-white/15 p-3 text-xs">
              {STAT_ORDER.map((k) => (
                <div key={k} className="flex justify-between gap-2">
                  <span className="text-white/50">{STAT_LABELS[k]}</span>
                  <span className="font-medium text-white">
                    {formatHeadlineStat(k, character.stats[k] ?? null)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* artifacts */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {artifacts.map((a) => (
              <div
                key={a.id}
                className="rounded-lg border border-white/15 p-3"
                style={{ boxShadow: `inset 0 0 0 1px ${rarityColor(a.rarity)}44` }}
              >
                <div className="flex items-center gap-2">
                  {a.iconUrl && <img src={a.iconUrl} alt="" className="h-10 w-10 rounded" />}
                  <div className="min-w-0">
                    <p className="truncate text-[11px] text-white/60">{a.mainStat.name}</p>
                    <p className="text-sm font-bold" style={{ color: rarityColor(a.rarity) }}>
                      {formatStat(a.mainStat.value, a.mainStat.isPercent)}
                    </p>
                  </div>
                  <span className="ml-auto text-[10px] text-white/40">+{a.level}</span>
                </div>
                <p className="mt-1 truncate text-[10px] text-white/40">{a.setName}</p>
                <ul className="mt-1.5 space-y-0.5">
                  {a.subStats.map((s, i) => (
                    <li key={i} className="flex justify-between text-[11px] text-white/60">
                      <span>{s.name}</span>
                      <span>{formatStat(s.value, s.isPercent)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
