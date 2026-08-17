import type { Character } from 'starrail.js';
import { config } from '../config/env.js';
import { hsrCharIcon, hsrLightConeIcon, hsrSlotName } from './hsr-icon.js';

const LANG = 'en';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- library stat objects are loosely typed
type AnyStat = any;

export interface HSRRelicSnapshot {
  slot: string;
  setName: string;
  rarity: number;
  level: number;
  iconUrl: string | null;
  mainStat: StatSnapshot;
  subStats: StatSnapshot[];
}

interface StatSnapshot {
  key: string;
  value: number;
  isPercent: boolean;
  name: string | null;
}

export interface HSRCharacterSnapshot {
  character: {
    avatarId: number;
    name: string;
    path: string | null;
    element: string | null;
    rarity: number;
    level: number;
    eidolon: number;
    iconUrl: string | null;
    lightConeName: string | null;
    lightConeIconUrl: string | null;
    lightConeLevel: number | null;
    lightConeSuperimpose: number | null;
    lightConeRarity: number | null;
    stats: Record<string, number | null>;
  };
  relics: HSRRelicSnapshot[];
}

function statValue(s: AnyStat): number | null {
  if (s == null) return null;
  return typeof s === 'number' ? s : (s.value ?? null);
}

function statSnapshot(s: AnyStat): StatSnapshot {
  // HSR relic stats are keyed by a raw StatPropertyType string (e.g. "HPDelta");
  // the frontend maps these to readable labels.
  return {
    key: s.type ?? s.statProperty ?? '',
    value: s.value,
    isPercent: s.isPercent,
    name: null,
  };
}

function eidolonRank(c: AnyStat): number {
  return (
    c.eidolons?.filter?.((e: AnyStat) => e.isUnlocked)?.length ??
    c.eidolonsIndex ??
    c._data?.rank ??
    0
  );
}

/** Map a resolved starrail.js Character to our display-ready snapshot.
 *  `nickname` fills the Trailblazer's name (the library returns a "{NICKNAME}" template). */
export function transformHSRCharacter(c: Character, nickname?: string): HSRCharacterSnapshot {
  const cd = c.characterData;
  const os: AnyStat = c.stats.overallStats;
  const base = config.hsrImageBase;
  const lc = c.lightCone;

  return {
    character: {
      avatarId: cd.id,
      name: cd.name.get(LANG).replace('{NICKNAME}', nickname ?? 'Trailblazer'),
      path: cd.path?.name?.get(LANG) ?? null,
      element: cd.combatType?.name?.get(LANG) ?? null,
      rarity: cd.stars,
      level: c.level,
      eidolon: eidolonRank(c),
      iconUrl: hsrCharIcon(base, cd.id),
      lightConeName: lc?.lightConeData?.name?.get(LANG) ?? null,
      lightConeIconUrl: hsrLightConeIcon(base, lc?.lightConeData?.id),
      lightConeLevel: lc?.level ?? null,
      lightConeSuperimpose:
        typeof lc?.superimposition === 'number'
          ? lc.superimposition
          : ((lc?.superimposition as AnyStat)?.value ??
            (lc?.superimposition as AnyStat)?.level ??
            null),
      lightConeRarity: lc?.lightConeData?.stars ?? null,
      stats: {
        hp: statValue(os.maxHP),
        atk: statValue(os.attack),
        def: statValue(os.defense),
        spd: statValue(os.speed),
        critRate: statValue(os.critRate),
        critDamage: statValue(os.critDamage),
      },
    },
    relics: (c.relics ?? []).map((r: AnyStat) => ({
      slot: hsrSlotName(r.relicData.type?.id ?? r.relicData.type),
      setName: r.relicData.set.name.get(LANG),
      rarity: r.relicData.stars,
      level: r.level,
      iconUrl: r.relicData.icon?.url ?? null,
      mainStat: statSnapshot(r.mainStat),
      subStats: (r.subStats ?? []).map(statSnapshot),
    })),
  };
}
