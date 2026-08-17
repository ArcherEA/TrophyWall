import type { ZZZRawAgent, ZZZRawEquipment, ZZZRawStat } from './zzz.client.js';
import type { ZZZStore, PropertyEntry } from './zzz.store.js';
import { config } from '../config/env.js';

// --- display maps -----------------------------------------------------------

const ELEMENT_MAP: Record<string, string> = {
  Physics: 'Physical',
  Elec: 'Electric',
  Fire: 'Fire',
  Ice: 'Ice',
  Ether: 'Ether',
};

// Agent rarity: 4 = S, 3 = A (no B-rank playable agents).
export function agentRarity(r: number): string {
  return r >= 4 ? 'S' : r >= 3 ? 'A' : String(r);
}

// Drive-disc rarity: 4 = S, 3 = A, 2 = B. Also drives the main-stat level curve.
export function discRarity(r: number): string {
  return r >= 4 ? 'S' : r === 3 ? 'A' : r === 2 ? 'B' : String(r);
}

// A disc's main stat reaches 4× its base at max level; max level depends on rarity.
const MAX_LEVEL: Record<number, number> = { 4: 15, 3: 12, 2: 9 };

// --- stat scaling (verified against live showcase data) ---------------------

export interface ZZZStatSnapshot {
  key: string; // raw property Name, e.g. "CritDmg"
  label: string; // friendly label
  value: number; // final display number (percent as e.g. 48.0, flat as e.g. 2200)
  isPercent: boolean;
  rolls?: number; // substat upgrade count
}

function isPercentFormat(p: PropertyEntry | undefined): boolean {
  return !!p && p.Format.includes('%');
}

/** Substat: raw value is per-roll (percent stored ×100); total = value × rolls. */
export function computeSubStat(
  raw: ZZZRawStat,
  property: Record<string, PropertyEntry>,
): ZZZStatSnapshot {
  const p = property[String(raw.PropertyId)];
  const percent = isPercentFormat(p);
  const total = raw.PropertyValue * raw.PropertyLevel;
  return {
    key: p?.Name ?? String(raw.PropertyId),
    label: statLabel(p?.Name),
    value: percent ? total / 100 : total,
    isPercent: percent,
    rolls: raw.PropertyLevel,
  };
}

/** Main stat: raw value is the +0 base; final = base × (1 + 3·L/maxLevel). */
export function computeMainStat(
  raw: ZZZRawStat,
  discLevel: number,
  discRarityNum: number,
  property: Record<string, PropertyEntry>,
): ZZZStatSnapshot {
  const p = property[String(raw.PropertyId)];
  const percent = isPercentFormat(p);
  const maxLevel = MAX_LEVEL[discRarityNum] ?? 15;
  const final = raw.PropertyValue * (1 + (3 * discLevel) / maxLevel);
  return {
    key: p?.Name ?? String(raw.PropertyId),
    label: statLabel(p?.Name),
    value: percent ? final / 100 : Math.round(final),
    isPercent: percent,
  };
}

// property Name → friendly label
const STAT_LABELS: Record<string, string> = {
  HpMax: 'HP',
  HpMax_Ratio: 'HP',
  Atk: 'ATK',
  Atk_Ratio: 'ATK',
  Def: 'DEF',
  Def_Ratio: 'DEF',
  BreakStun: 'Impact',
  BreakStun_Ratio: 'Impact',
  Crit: 'CRIT Rate',
  CritDmg: 'CRIT DMG',
  ElementMystery: 'Anomaly Proficiency',
  ElementAbnormalPower: 'Anomaly Mastery',
  ElementAbnormalPower_Ratio: 'Anomaly Mastery',
  PenDelta: 'PEN',
  PenRatio: 'PEN Ratio',
  SpRecover: 'Energy Regen',
  SpRecover_Ratio: 'Energy Regen',
  AddedDamageRatio_Physics: 'Physical DMG',
  AddedDamageRatio_Fire: 'Fire DMG',
  AddedDamageRatio_Ice: 'Ice DMG',
  AddedDamageRatio_Elec: 'Electric DMG',
  AddedDamageRatio_Ether: 'Ether DMG',
};

export function statLabel(name: string | undefined): string {
  if (!name) return '';
  if (STAT_LABELS[name]) return STAT_LABELS[name];
  // "%"-style keys reuse the base label; strip the _Ratio suffix as a fallback
  const base = name.replace(/_Ratio$/, '');
  return STAT_LABELS[base] ?? name;
}

// --- snapshots --------------------------------------------------------------

export interface ZZZDiscSnapshot {
  slot: number;
  setName: string;
  rarity: string;
  level: number;
  iconUrl: string | null;
  mainStat: ZZZStatSnapshot;
  subStats: ZZZStatSnapshot[];
}

export interface ZZZAgentSnapshot {
  agent: {
    avatarId: number;
    name: string;
    element: string | null;
    profession: string | null;
    rarity: string;
    level: number;
    mindscape: number;
    accentColor: string | null;
    iconUrl: string | null;
    wEngineName: string | null;
    wEngineIconUrl: string | null;
    wEngineLevel: number | null;
    wEnginePhase: number | null;
    wEngineRarity: string | null;
    wEngineStatLabel: string | null; // advanced stat type, e.g. "CRIT Rate"
    wEngineEffectName: string | null; // signature effect title
    wEngineEffectDesc: string | null; // effect description at the equipped phase
  };
  discs: ZZZDiscSnapshot[];
}

/** The signature-effect text for the equipped phase (resolved from the weapon tooltip). */
export interface ZZZWEngineEffect {
  name: string | null;
  description: string | null;
}

// game tooltip text is wrapped in <color=#hex>…</color> (and similar) markup — strip to plain text
export function stripTooltipTags(s: string | undefined): string | null {
  if (!s) return null;
  return s.replace(/<[^>]+>/g, '').trim() || null;
}

function icon(base: string, path: string | undefined | null): string | null {
  return path ? `${base}${path}` : null;
}

function transformDisc(
  slot: number,
  eq: ZZZRawEquipment,
  store: ZZZStore,
  base: string,
): ZZZDiscSnapshot {
  const item = store.equipments.Items[String(eq.Id)];
  const rarityNum = item?.Rarity ?? 4;
  const suit = item ? store.equipments.Suits[String(item.SuitId)] : undefined;
  const setName = suit ? (store.loc[suit.Name] ?? suit.Name) : 'Unknown Set';

  return {
    slot,
    setName,
    rarity: discRarity(rarityNum),
    level: eq.Level,
    iconUrl: icon(base, suit?.Icon),
    mainStat: computeMainStat(eq.MainPropertyList[0], eq.Level, rarityNum, store.property),
    subStats: eq.RandomPropertyList.map((s) => computeSubStat(s, store.property)),
  };
}

/** Resolve a raw ZZZ agent + its store data into a display-ready snapshot.
 *  `effect` is the equipped-phase signature-effect text (fetched separately, best-effort). */
export function transformZZZAgent(
  raw: ZZZRawAgent,
  store: ZZZStore,
  effect?: ZZZWEngineEffect,
): ZZZAgentSnapshot {
  const base = config.zzzImageBase;
  const a = store.avatars[String(raw.Id)];
  const rawElement = a?.ElementTypes?.[0];
  const w = raw.Weapon;
  const wData = w ? store.weapons[String(w.Id)] : undefined;
  const advancedStatId = wData?.SecondaryStat?.PropertyId;

  return {
    agent: {
      avatarId: raw.Id,
      name: a ? (store.loc[a.Name] ?? a.Name) : `Agent ${raw.Id}`,
      element: rawElement ? (ELEMENT_MAP[rawElement] ?? rawElement) : null,
      profession: a?.ProfessionType ?? null,
      rarity: agentRarity(a?.Rarity ?? 0),
      level: raw.Level,
      mindscape: raw.TalentLevel ?? 0,
      accentColor: a?.Colors?.Accent ?? null,
      iconUrl: icon(base, a?.CircleIcon ?? a?.Image),
      wEngineName: wData ? (store.loc[wData.ItemName] ?? wData.ItemName) : null,
      wEngineIconUrl: icon(base, wData?.ImagePath),
      wEngineLevel: w?.Level ?? null,
      wEnginePhase: w ? w.UpgradeLevel : null, // UpgradeLevel is 1-indexed (P1–P5)
      wEngineRarity: wData ? agentRarity(wData.Rarity) : null,
      wEngineStatLabel:
        advancedStatId != null ? statLabel(store.property[String(advancedStatId)]?.Name) : null,
      wEngineEffectName: effect?.name ?? null,
      wEngineEffectDesc: effect?.description ?? null,
    },
    discs: raw.EquippedList.map((e) => transformDisc(e.Slot, e.Equipment, store, base)),
  };
}
