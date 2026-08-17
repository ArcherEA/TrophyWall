export type Rarity = 'legendary' | 'epic' | 'rare' | 'common';

// globalPercent = fraction of all players who unlocked it → lower means rarer
export function getRarity(globalPercent: number | null): Rarity | null {
  if (globalPercent == null) return null;
  if (globalPercent <= 5) return 'legendary';
  if (globalPercent <= 15) return 'epic';
  if (globalPercent <= 40) return 'rare';
  return 'common';
}

export const rarityMeta: Record<Rarity, { label: string; text: string }> = {
  legendary: { label: 'Legendary', text: 'text-amber-400' },
  epic: { label: 'Epic', text: 'text-purple-400' },
  rare: { label: 'Rare', text: 'text-blue-400' },
  common: { label: 'Common', text: 'text-white/40' },
};
