import { prisma } from '../lib/prisma.js';
import { accountService } from './account.service.js';
import { buildGameList } from './profile-transform.js';

async function getProfile() {
  const account = await accountService.getActiveAccount();
  if (!account) return null;

  const base = {
    externalId: account.externalId,
    platform: account.platform,
    displayName: account.displayName,
    avatar: account.avatarUrl,
    lastSyncedAt: account.lastSyncedAt,
  };

  if (account.platform === 'GENSHIN') {
    const characters = await prisma.genshinCharacter.findMany({
      where: { linkedAccountId: account.id },
      include: { artifacts: true },
      orderBy: [{ rarity: 'desc' }, { level: 'desc' }],
    });
    return { account: base, characters };
  }

  if (account.platform === 'HSR') {
    const characters = await prisma.hSRCharacter.findMany({
      where: { linkedAccountId: account.id },
      include: { relics: true },
      orderBy: [{ rarity: 'desc' }, { level: 'desc' }],
    });
    return { account: base, characters };
  }

  // default: STEAM
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

  return { account: base, games: buildGameList(games, achievements) };
}

export const profileService = { getProfile };
