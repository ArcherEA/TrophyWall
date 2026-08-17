import type { LinkedAccounts } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { accountService } from './account.service.js';
import { buildGameList } from './profile-transform.js';

/** Build the display-ready profile for a single linked account (platform-specific). */
async function buildProfileForAccount(account: LinkedAccounts) {
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

  if (account.platform === 'ZZZ') {
    const characters = await prisma.zZZAgent.findMany({
      where: { linkedAccountId: account.id },
      include: { discs: true },
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

/** Single active account (used by the live API / local dev). */
async function getProfile() {
  const account = await accountService.getActiveAccount();
  if (!account) return null;
  return buildProfileForAccount(account);
}

// Display order for the aggregated view — Steam first, then the HoYo showcases.
const PLATFORM_ORDER = ['STEAM', 'GENSHIN', 'HSR', 'ZZZ'];

/** Every linked account's profile, ordered for display (used by the static export). */
async function getAllProfiles() {
  const accounts = await accountService.listAccounts();
  const ordered = [...accounts].sort(
    (a, b) => PLATFORM_ORDER.indexOf(a.platform) - PLATFORM_ORDER.indexOf(b.platform),
  );
  return Promise.all(ordered.map(buildProfileForAccount));
}

export const profileService = { getProfile, getAllProfiles, buildProfileForAccount };
