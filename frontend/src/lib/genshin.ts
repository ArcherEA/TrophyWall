export const ELEMENT_COLORS: Record<string, string> = {
  Pyro: '#ef7a35',
  Hydro: '#4cc2f1',
  Electro: '#b784e0',
  Cryo: '#7bd3e8',
  Anemo: '#74c2a8',
  Geo: '#f8ba4e',
  Dendro: '#a5c83b',
};

export function elementColor(element: string | null): string {
  return (element && ELEMENT_COLORS[element]) || '#e5e5e5';
}

// 5★ = gold, 4★ = purple
export function rarityColor(rarity: number): string {
  return rarity >= 5 ? '#d4a54a' : '#a97bd6';
}

// headline character stats: which are ratios (shown as %) vs flat numbers
const PERCENT_STATS = new Set(['critRate', 'critDamage', 'energyRecharge', 'elementalDamage']);

export const STAT_LABELS: Record<string, string> = {
  hp: 'HP',
  atk: 'ATK',
  def: 'DEF',
  critRate: 'Crit Rate',
  critDamage: 'Crit DMG',
  energyRecharge: 'Energy Recharge',
  elementalMastery: 'Elem. Mastery',
  elementalDamage: 'Elem. DMG Bonus',
};

export function formatHeadlineStat(key: string, value: number | null): string {
  if (value == null) return '—';
  if (PERCENT_STATS.has(key)) return `${(value * 100).toFixed(1)}%`;
  return Math.round(value).toLocaleString();
}

// artifact main/sub stats already carry isPercent from the backend
export function formatStat(value: number, isPercent: boolean): string {
  return isPercent ? `${(value * 100).toFixed(1)}%` : Math.round(value).toLocaleString();
}
