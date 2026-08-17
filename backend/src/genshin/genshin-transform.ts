import type { Character } from 'enka-network-api';
import { config } from '../config/env.js';
import { buildIconUrl } from './genshin-icon.js';
import { slotName, ELEMENT_DAMAGE_STAT } from './genshin-slot.js';

const LANG = 'en';

export interface GenshinCharacterSnapshot {
  character: {
    avatarId: number;
    name: string;
    element: string | null;
    rarity: number;
    level: number;
    constellation: number;
    friendship: number | null;
    iconUrl: string | null;
    talentNormal: number | null;
    talentSkill: number | null;
    talentBurst: number | null;
    weaponName: string | null;
    weaponIconUrl: string | null;
    weaponLevel: number | null;
    weaponRefinement: number | null;
    weaponRarity: number | null;
    stats: Record<string, number | null>;
  };
  artifacts: Array<{
    slot: string;
    setName: string;
    rarity: number;
    level: number;
    iconUrl: string | null;
    mainStat: StatSnapshot;
    subStats: StatSnapshot[];
  }>;
}

interface StatSnapshot {
  key: string;
  value: number;
  isPercent: boolean;
  name: string | null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- library stat objects are loosely typed
type AnyStat = any;

function statValue(stat: AnyStat): number | null {
  return stat?.value ?? null;
}

function statSnapshot(stat: AnyStat): StatSnapshot {
  return {
    key: stat.fightProp,
    value: stat.value,
    isPercent: stat.isPercent,
    name: stat.fightPropName?.get?.(LANG) ?? null,
  };
}

/** Map a resolved Enka character to our display-ready snapshot (character + artifacts). */
export function transformCharacter(c: Character): GenshinCharacterSnapshot {
  const cd = c.characterData;
  const s: AnyStat = c.stats;
  const base = config.genshinImageBase;

  const levelOf = (id: number | undefined) =>
    c.skillLevels.find((sl) => sl.skill?.id === id)?.level?.value ?? null;

  const elementName = cd.element?.name?.get(LANG) ?? null;
  const elemStatKey = elementName ? ELEMENT_DAMAGE_STAT[elementName] : undefined;

  return {
    character: {
      avatarId: cd.id,
      name: cd.name.get(LANG),
      element: elementName,
      rarity: cd.stars,
      level: c.level,
      constellation: c.unlockedConstellations.length,
      friendship: c.friendship ?? null,
      iconUrl: buildIconUrl(base, cd.icon?.name),
      talentNormal: levelOf(cd.normalAttack?.id),
      talentSkill: levelOf(cd.elementalSkill?.id),
      talentBurst: levelOf(cd.elementalBurst?.id),
      weaponName: c.weapon.weaponData.name.get(LANG),
      weaponIconUrl: buildIconUrl(base, c.weapon.weaponData.icon?.name),
      weaponLevel: c.weapon.level,
      weaponRefinement: c.weapon.refinementRank,
      weaponRarity: c.weapon.weaponData.stars,
      stats: {
        hp: statValue(s.maxHealth),
        atk: statValue(s.attack),
        def: statValue(s.defense),
        critRate: statValue(s.critRate),
        critDamage: statValue(s.critDamage),
        energyRecharge: statValue(s.chargeEfficiency),
        elementalMastery: statValue(s.elementMastery),
        elementalDamage: elemStatKey ? statValue(s[elemStatKey]) : null,
      },
    },
    artifacts: c.artifacts.map((a) => ({
      slot: slotName(a.artifactData.equipType),
      setName: a.artifactData.set.name.get(LANG),
      rarity: a.artifactData.stars,
      level: a.level,
      iconUrl: buildIconUrl(base, a.artifactData.icon?.name),
      mainStat: statSnapshot(a.mainstat),
      subStats: (a.substats.total as AnyStat[]).map(statSnapshot),
    })),
  };
}
