export const HSR_ELEMENT_COLORS: Record<string, string> = {
  Physical: '#d9d9d9',
  Fire: '#f84e3c',
  Ice: '#7cd5f0',
  Lightning: '#c78bf0',
  Wind: '#78d6a3',
  Quantum: '#6a5fd6',
  Imaginary: '#f4d95b',
};

export function hsrElementColor(element: string | null): string {
  return (element && HSR_ELEMENT_COLORS[element]) || '#e5e5e5';
}

export function hsrRarityColor(rarity: number): string {
  return rarity >= 5 ? '#d4a54a' : '#a97bd6';
}

// raw StatPropertyType key → readable label (relic main/sub stats + headline stats)
export const HSR_STAT_LABELS: Record<string, string> = {
  // headline (character-level, our own keys)
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  spd: 'SPD',
  critRate: 'CRIT Rate',
  critDamage: 'CRIT DMG',
  // relic stat keys (StatPropertyType)
  HPDelta: 'HP',
  HPAddedRatio: 'HP',
  AttackDelta: 'ATK',
  AttackAddedRatio: 'ATK',
  DefenceDelta: 'DEF',
  DefenceAddedRatio: 'DEF',
  SpeedDelta: 'SPD',
  CriticalChanceBase: 'CRIT Rate',
  CriticalDamageBase: 'CRIT DMG',
  StatusProbabilityBase: 'Effect Hit Rate',
  StatusResistanceBase: 'Effect RES',
  BreakDamageAddedRatioBase: 'Break Effect',
  SPRatioBase: 'Energy Regen',
  HealRatioBase: 'Healing Boost',
  PhysicalAddedRatio: 'Physical DMG',
  FireAddedRatio: 'Fire DMG',
  IceAddedRatio: 'Ice DMG',
  ThunderAddedRatio: 'Lightning DMG',
  WindAddedRatio: 'Wind DMG',
  QuantumAddedRatio: 'Quantum DMG',
  ImaginaryAddedRatio: 'Imaginary DMG',
};

export function hsrStatLabel(key: string): string {
  return HSR_STAT_LABELS[key] ?? key;
}

const HEADLINE_PERCENT = new Set(['critRate', 'critDamage']);

export function hsrHeadlineStat(key: string, value: number | null): string {
  if (value == null) return '—';
  if (HEADLINE_PERCENT.has(key)) return `${(value * 100).toFixed(1)}%`;
  return Math.round(value).toLocaleString();
}

export function hsrStatValue(value: number, isPercent: boolean): string {
  return isPercent ? `${(value * 100).toFixed(1)}%` : Math.round(value).toLocaleString();
}
