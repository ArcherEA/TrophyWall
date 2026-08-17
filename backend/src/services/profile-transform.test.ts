import { describe, it, expect } from 'vitest';
import { buildGameList, type GameRow, type AchievementRow } from './profile-transform.js';

function gameRow(appId: number, over: Partial<GameRow> = {}): GameRow {
  return {
    appId,
    playtimeForever: 100,
    playtime2Weeks: null,
    catalogEntry: {
      name: `Game ${appId}`,
      iconUrl: 'icon',
      headerUrl: 'header',
      capsuleUrl: 'capsule',
      libraryCoverUrl: 'cover',
    },
    ...over,
  };
}

function achRow(
  appId: number,
  unlocked: boolean,
  over: Partial<AchievementRow['achievementCatalog']> = {},
): AchievementRow {
  return {
    unlocked,
    unlockedAt: unlocked ? new Date('2026-01-01') : null,
    achievementCatalog: {
      appId,
      apiName: `a_${appId}_${unlocked}`,
      displayName: 'Ach',
      description: 'desc',
      iconUrl: 'color.jpg',
      iconGrayUrl: 'gray.jpg',
      hidden: false,
      globalPercent: 12.5,
      ...over,
    },
  };
}

describe('buildGameList', () => {
  it('groups achievements to their game and computes completion %', () => {
    const games = [gameRow(730), gameRow(570)];
    const achievements = [
      achRow(730, true),
      achRow(730, false),
      achRow(730, true),
      achRow(570, false),
    ];
    const [cs, dota] = buildGameList(games, achievements);

    expect(cs.achievements.total).toBe(3);
    expect(cs.achievements.unlocked).toBe(2);
    expect(cs.achievements.percent).toBe(67); // round(2/3)
    expect(dota.achievements.total).toBe(1);
    expect(dota.achievements.percent).toBe(0);
  });

  it('returns percent null and empty items for a game with no achievements', () => {
    const [g] = buildGameList([gameRow(1)], []);
    expect(g.achievements.total).toBe(0);
    expect(g.achievements.percent).toBeNull();
    expect(g.achievements.items).toEqual([]);
  });

  it('uses the colored icon when unlocked and the gray icon when locked', () => {
    const games = [gameRow(1)];
    const [g] = buildGameList(games, [achRow(1, true), achRow(1, false)]);
    const [unlocked, locked] = g.achievements.items;
    expect(unlocked.icon).toBe('color.jpg');
    expect(locked.icon).toBe('gray.jpg');
  });

  it('passes through globalPercent and maps images from the catalog', () => {
    const [g] = buildGameList([gameRow(1)], [achRow(1, true)]);
    expect(g.achievements.items[0].globalPercent).toBe(12.5);
    expect(g.images).toEqual({
      icon: 'icon',
      header: 'header',
      capsule: 'capsule',
      libraryCover: 'cover',
    });
  });
});
