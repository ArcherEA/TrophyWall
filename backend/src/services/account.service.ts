import { prisma } from '../lib/prisma.js';
import { steamClient } from '../steam/steam.client.js';

const DEV_USER_EMAIL = 'dev@trophywall.local';

async function getOrCreateDevUser() {
  return prisma.user.upsert({
    where: { email: DEV_USER_EMAIL },
    create: { email: DEV_USER_EMAIL, passwordHash: 'dev-placeholder' },
    update: {},
  });
}

// exactly one active account per user, across ALL platforms
async function setActive(userId: string, accountId: string) {
  await prisma.$transaction([
    prisma.linkedAccounts.updateMany({ where: { userId }, data: { isActive: false } }),
    prisma.linkedAccounts.update({ where: { id: accountId }, data: { isActive: true } }),
  ]);
}

function notFound(message: string) {
  const err = new Error(message);
  (err as any).status = 404;
  return err;
}

async function linkSteamAccount(steamId: string) {
  const user = await getOrCreateDevUser();

  const existing = await prisma.linkedAccounts.findUnique({
    where: {
      userId_platform_externalId: { userId: user.id, platform: 'STEAM', externalId: steamId },
    },
  });
  if (existing) {
    await setActive(user.id, existing.id);
    return existing;
  }

  // validate + fetch profile from Steam
  const profile = await steamClient.getPlayerSummary(steamId);
  if (!profile) throw notFound(`Steam ID not found: ${steamId}`);

  const created = await prisma.linkedAccounts.create({
    data: {
      userId: user.id,
      platform: 'STEAM',
      externalId: steamId,
      displayName: profile.personaname,
      avatarUrl: profile.avatarfull,
      isActive: true,
    },
  });
  await setActive(user.id, created.id);
  return created;
}

// Genshin + HSR share the same UID-based link flow (name/avatar filled on first sync)
async function linkHoyoAccount(platform: 'GENSHIN' | 'HSR', uid: string) {
  const user = await getOrCreateDevUser();
  if (!/^\d{9,10}$/.test(uid)) {
    const err = new Error('Invalid UID (expected 9–10 digits)');
    (err as any).status = 400;
    throw err;
  }

  const existing = await prisma.linkedAccounts.findUnique({
    where: { userId_platform_externalId: { userId: user.id, platform, externalId: uid } },
  });
  if (existing) {
    await setActive(user.id, existing.id);
    return existing;
  }

  const created = await prisma.linkedAccounts.create({
    data: { userId: user.id, platform, externalId: uid, isActive: true },
  });
  await setActive(user.id, created.id);
  return created;
}

async function getActiveAccount() {
  const user = await getOrCreateDevUser(); // v1 dev user; later: the authenticated user
  return prisma.linkedAccounts.findFirst({ where: { userId: user.id, isActive: true } });
}

async function listAccounts() {
  const user = await getOrCreateDevUser();
  return prisma.linkedAccounts.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });
}

async function switchAccount(accountId: string) {
  const user = await getOrCreateDevUser();
  const acc = await prisma.linkedAccounts.findFirst({ where: { id: accountId, userId: user.id } });
  if (!acc) throw notFound('Account not found');
  await setActive(user.id, accountId);
  return acc;
}

export const accountService = {
  linkSteamAccount,
  linkHoyoAccount,
  getActiveAccount,
  listAccounts,
  switchAccount,
};
