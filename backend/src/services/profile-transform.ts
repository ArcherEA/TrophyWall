// Minimal shapes this transform needs (structurally satisfied by the Prisma rows).
export interface GameRow {
  appId: number;
  playtimeForever: number;
  playtime2Weeks: number | null;
  catalogEntry: {
    name: string;
    iconUrl: string | null;
    headerUrl: string | null;
    capsuleUrl: string | null;
    libraryCoverUrl: string | null;
  };
}

export interface AchievementRow {
  unlocked: boolean;
  unlockedAt: Date | null;
  achievementCatalog: {
    appId: number;
    apiName: string;
    displayName: string;
    description: string | null;
    iconUrl: string;
    iconGrayUrl: string;
    hidden: boolean;
    globalPercent: number | null;
  };
}

/**
 * Pure transform: groups a flat list of the user's achievements by game and
 * shapes each game (with playtime, images, and per-game completion) for the API.
 */
export function buildGameList(games: GameRow[], achievements: AchievementRow[]) {
  const byApp = new Map<number, AchievementRow[]>();
  for (const a of achievements) {
    const appId = a.achievementCatalog.appId;
    const list = byApp.get(appId) ?? [];
    list.push(a);
    byApp.set(appId, list);
  }

  return games.map((g) => {
    const ach = byApp.get(g.appId) ?? [];
    const unlocked = ach.filter((a) => a.unlocked).length;
    return {
      appId: g.appId,
      name: g.catalogEntry.name,
      playtimeForever: g.playtimeForever,
      playtime2Weeks: g.playtime2Weeks,
      images: {
        icon: g.catalogEntry.iconUrl,
        header: g.catalogEntry.headerUrl,
        capsule: g.catalogEntry.capsuleUrl,
        libraryCover: g.catalogEntry.libraryCoverUrl,
      },
      achievements: {
        total: ach.length,
        unlocked,
        percent: ach.length ? Math.round((unlocked / ach.length) * 100) : null,
        items: ach.map((a) => ({
          apiName: a.achievementCatalog.apiName,
          displayName: a.achievementCatalog.displayName,
          description: a.achievementCatalog.description,
          icon: a.unlocked ? a.achievementCatalog.iconUrl : a.achievementCatalog.iconGrayUrl,
          hidden: a.achievementCatalog.hidden,
          globalPercent: a.achievementCatalog.globalPercent,
          unlocked: a.unlocked,
          unlockedAt: a.unlockedAt,
        })),
      },
    };
  });
}
