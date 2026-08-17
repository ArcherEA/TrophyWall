import { prisma } from '../lib/prisma.js';
import { accountService } from './account.service.js';
import { buildGameList } from './profile-transform.js';

async function getSteamProfile() {
  const account = await accountService.getSteamAccountForCurrentUser();
  if (!account) return null;

  const [games, achievements] = await Promise.all([
    prisma.steamGame.findMany({
      where: { linkedAccountId: account.id },
      include: { catalogEntry: true },
      orderBy: { playtimeForever: 'desc' },
    }),
    prisma.steamAchievement.findMany({
      where: { linkedAccountId: account.id },
      include: { achievementCatalog: true },
    }),
  ]);

  return {
    account: {
      steamId: account.externalId,
      displayName: account.displayName,
      avatar: account.avatarUrl,
      lastSyncedAt: account.lastSyncedAt,
    },
    games: buildGameList(games, achievements),
  };
}

export const profileService = { getSteamProfile };
