import { describe, it, expect } from 'vitest';
import { sortAndFilter, type GameFilter } from './game-filter';
import type { Game } from '../api/types';

function game(name: string, playtime: number, total: number, percent: number | null): Game {
  return {
    appId: name.length,
    name,
    playtimeForever: playtime,
    playtime2Weeks: null,
    images: { icon: null, header: null, capsule: null, libraryCover: null },
    achievements: { total, unlocked: 0, percent, items: [] },
  };
}

const games = [
  game('Alpha', 100, 10, 20),
  game('Bravo', 300, 0, null), // no achievements
  game('Charlie', 50, 5, 80),
];

const opts = (o: Partial<GameFilter> = {}): GameFilter => ({
  q: '',
  sort: 'playtime',
  onlyAch: false,
  ...o,
});

describe('sortAndFilter', () => {
  it('sorts by playtime descending by default', () => {
    expect(sortAndFilter(games, opts()).map((g) => g.name)).toEqual(['Bravo', 'Alpha', 'Charlie']);
  });

  it('sorts by completion, treating no-data as lowest', () => {
    expect(sortAndFilter(games, opts({ sort: 'completion' })).map((g) => g.name)).toEqual([
      'Charlie', // 80
      'Alpha', // 20
      'Bravo', // null → last
    ]);
  });

  it('sorts by name A–Z', () => {
    expect(sortAndFilter(games, opts({ sort: 'name' })).map((g) => g.name)).toEqual([
      'Alpha',
      'Bravo',
      'Charlie',
    ]);
  });

  it('filters by case-insensitive search', () => {
    expect(sortAndFilter(games, opts({ q: 'char' })).map((g) => g.name)).toEqual(['Charlie']);
  });

  it('filters to games with achievements', () => {
    expect(sortAndFilter(games, opts({ onlyAch: true })).map((g) => g.name)).toEqual([
      'Alpha',
      'Charlie',
    ]);
  });

  it('does not mutate the input array', () => {
    const input = [...games];
    sortAndFilter(input, opts({ sort: 'name' }));
    expect(input).toEqual(games);
  });
});
