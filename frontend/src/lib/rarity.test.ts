import { describe, it, expect } from 'vitest';
import { getRarity } from './rarity';

describe('getRarity', () => {
  it('returns null when there is no rarity data', () => {
    expect(getRarity(null)).toBeNull();
  });

  it('classifies by global unlock % (rarer = lower %)', () => {
    expect(getRarity(3)).toBe('legendary'); // ≤ 5
    expect(getRarity(5)).toBe('legendary');
    expect(getRarity(12)).toBe('epic'); // ≤ 15
    expect(getRarity(30)).toBe('rare'); // ≤ 40
    expect(getRarity(70)).toBe('common'); // > 40
  });
});
