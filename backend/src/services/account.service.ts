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

async function linkSteamAccount(steamId: string) {
    const user = await getOrCreateDevUser();

    // does THIS user already have this exact Steam ID linked? → reuse, skip API
  const existing = await prisma.linkedAccounts.findUnique({
    where: { userId_platform: { userId: user.id, platform: 'STEAM' } },
  });
  if (existing && existing.externalId === steamId) return existing;

  // otherwise validate + fetch from Steam
  const profile = await steamClient.getPlayerSummary(steamId);
  if (!profile) {
    const err = new Error(`Steam ID not found: ${steamId}`);
    (err as any).status = 404;
    throw err;
  }

  // upsert for THIS user (create, or overwrite if they're re-linking a different ID)
  return prisma.linkedAccounts.upsert({
    where: { userId_platform: { userId: user.id, platform: 'STEAM' } },
    create: {
      userId: user.id,
      platform: 'STEAM',
      externalId: steamId,
      displayName: profile.personaname,
    },
    update: {
      externalId: steamId,
      displayName: profile.personaname,
    },
  });
}

async function getSteamAccountForCurrentUser() {
  const user = await getOrCreateDevUser();   // v1 dev user; later: the authenticated user
  return prisma.linkedAccounts.findUnique({
    where: { userId_platform: { userId: user.id, platform: 'STEAM' } },
  });
}


export const accountService = { linkSteamAccount, getSteamAccountForCurrentUser };
