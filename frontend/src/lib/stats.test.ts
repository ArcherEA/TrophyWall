import { describe, it, expect } from 'vitest';
import { computeStats } from './stats';
import type { Game } from '../api/types';

function game(partial: Partial<Game> & { achievements: Game['achievements'] }): Game {
  return {
    appId: 1,
    name: 'G',
    playtimeForever: 0,
    playtime2Weeks: null,
    images: { icon: null, header: null, capsule: null, libraryCover: null },
    ...partial,
  };
}

const ach = (total: number, unlocked: number, percent: number | null) => ({
  total,
  unlocked,
  percent,
  items: [],
});

describe('computeStats', () => {
  it('returns zeros for an empty library', () => {
    expect(computeStats([])).toEqual({
      gameCount: 0,
      hours: 0,
      unlocked: 0,
      totalAchievements: 0,
      overall: 0,
      perfect: 0,
    });
  });

  it('aggregates counts, hours, overall %, and perfect games', () => {
    const games = [
      game({ playtimeForever: 90, achievements: ach(10, 5, 50) }), // 1.5h
      game({ playtimeForever: 30, achievements: ach(4, 4, 100) }), // perfect
      game({ playtimeForever: 0, achievements: ach(0, 0, null) }), // no achievements
    ];
    const s = computeStats(games);
    expect(s.gameCount).toBe(3);
    expect(s.hours).toBe(2); // (90+30+0)/60 = 2
    expect(s.unlocked).toBe(9);
    expect(s.totalAchievements).toBe(14);
    expect(s.overall).toBe(Math.round((9 / 14) * 100)); // 64
    expect(s.perfect).toBe(1);
  });

  it('does not count a 0-achievement game as perfect', () => {
    expect(computeStats([game({ achievements: ach(0, 0, null) })]).perfect).toBe(0);
  });
});
