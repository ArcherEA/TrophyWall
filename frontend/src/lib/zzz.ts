export const ZZZ_ELEMENT_COLORS: Record<string, string> = {
  Physical: '#f2f0c8',
  Fire: '#f84e3c',
  Ice: '#7cd5f0',
  Electric: '#c78bf0',
  Ether: '#f25ba0',
};

export function zzzElementColor(element: string | null): string {
  return (element && ZZZ_ELEMENT_COLORS[element]) || '#e5e5e5';
}

// Agent (S/A) and drive-disc (S/A/B) rarity → accent color
export function zzzRarityColor(rarity: string): string {
  return rarity === 'S' ? '#f5b942' : rarity === 'A' ? '#c07be0' : '#5aa9d6';
}

// Drive discs are shown partition 1 → 6
export const ZZZ_SLOT_ORDER = [1, 2, 3, 4, 5, 6];

export function zzzStatValue(value: number, isPercent: boolean): string {
  if (isPercent) return `${value.toFixed(1)}%`;
  return Math.round(value).toLocaleString();
}
