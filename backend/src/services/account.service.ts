import { prisma } from "../lib/prisma.js";
import { config } from "../config/env.js";
import { steamClient } from "../steam/steam.client.js";

const DEV_USER_EMAIL = "dev@trophywall.local";

async function getOrCreateDevUser() {
    return prisma.user.upsert({
        where: {email: DEV_USER_EMAIL },
        create: {email: DEV_USER_EMAIL, passwordHash: 'dev-placeholder'},
        update: {}
    });
}

async function setActive(userId: string, accountId: string) {
  // enforce single-active: deactivate all, then activate the target
  await prisma.$transaction([
    prisma.linkedAccounts.updateMany({
      where: { userId, platform: 'STEAM' },
      data: { isActive: false },
    }),
    prisma.linkedAccounts.update({
      where: { id: accountId },
      data: { isActive: true },
    }),
  ]);
}

async function linkSteamAccount(steamId: string) {
  const user = await getOrCreateDevUser();

  // does THIS user already have this exact Steam ID linked? → reuse, skip API
  const existing = await prisma.linkedAccounts.findUnique({
    where: { userId_platform_externalId: { userId: user.id, platform: 'STEAM',externalId: steamId } },
  });
  if (existing ) {
    await setActive(user.id, existing.id);
    return existing;
  } 

  // otherwise validate + fetch from Steam
  const profile = await steamClient.getPlayerSummary(steamId);
  if (!profile) {
    const err = new Error(`Steam ID not found: ${steamId}`);
    (err as any).status = 404;
    throw err;
  }

  const created = await prisma.linkedAccounts.create({
    data: { 
      userId: user.id, 
      platform: 'STEAM', 
      externalId: steamId, 
      displayName: profile.personaname, 
      isActive: true 
    },
  });
  await setActive(user.id, created.id); 
  return created;
}

async function getSteamAccountForCurrentUser() {
  const user = await getOrCreateDevUser();   // v1 dev user; later: the authenticated user
  return prisma.linkedAccounts.findFirst({
    where: { userId: user.id, platform: 'STEAM', isActive: true},
  });
}
async function listSteamAccounts() {
  const user = await getOrCreateDevUser();
  return prisma.linkedAccounts.findMany({
    where: { userId: user.id, platform: 'STEAM' },
    orderBy: { createdAt: 'asc' },
  });
}

async function switchSteamAccount(accountId: string) {
  const user = await getOrCreateDevUser();
  const acc = await prisma.linkedAccounts.findFirst({ where: { id: accountId, userId: user.id } });
  if (!acc) {
    const err = new Error('Account not found'); (err as any).status = 404; throw err;
  }
  await setActive(user.id, accountId);
  return acc;
}

export const accountService = { linkSteamAccount, getSteamAccountForCurrentUser, listSteamAccounts, switchSteamAccount, };
