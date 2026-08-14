/*
// Ai generated code, I will use it as reference 
// services/steam-sync.service.ts
import { prisma } from '../lib/prisma.js';
import { steamClient } from '../integrations/steam/steam.client.js';

async function syncAccount(linkedAccountId: string) {
  // 1. find the account → gives us the Steam ID
  const account = await prisma.linkedAccounts.findUniqueOrThrow({
    where: { id: linkedAccountId },
  });
  const steamId = account.externalId;

  // 2. pull the library from Steam
  const games = await steamClient.getOwnedGames(steamId);

  let gamesSynced = 0;
  for (const g of games) {
    await syncOneGame(linkedAccountId, steamId, g);
    gamesSynced++;
  }

  // 3. stamp the account as freshly synced
  await prisma.linkedAccounts.update({
    where: { id: linkedAccountId },
    data: { lastSyncedAt: new Date() },
  });

  return { gamesSynced };
}

async function syncOneGame(
  linkedAccountId: string,
  steamId: string,
  g: { appid: number; name: string; playtime_forever: number; playtime_2weeks?: number },
) {
  // --- catalog (shared reference data): upsert, keyed on @id appId ---
  await prisma.steamGameCatalog.upsert({
    where: { appId: g.appid },
    create: { appId: g.appid, name: g.name },
    update: { name: g.name, lastFetched: new Date() },
  });

  // --- per-user game row: upsert on your @@unique([linkedAccountId, appId]) ---
  await prisma.steamGame.upsert({
    where: { linkedAccountId_appId: { linkedAccountId, appId: g.appid } },
    create: {
      linkedAccountId,
      appId: g.appid,
      playtimeForever: g.playtime_forever,
      playtime2Weeks: g.playtime_2weeks ?? null,
    },
    update: {
      playtimeForever: g.playtime_forever,
      playtime2Weeks: g.playtime_2weeks ?? null,
      lastSyncedAt: new Date(),
    },
  });

  // --- achievements for this game ---
  await syncAchievements(linkedAccountId, steamId, g.appid);
}

async function syncAchievements(linkedAccountId: string, steamId: string, appId: number) {
  const [schema, playerAch] = await Promise.all([
    steamClient.getSchemaForGame(appId),      // definitions
    steamClient.getPlayerAchievements(steamId, appId),  // this user's unlocks
  ]);

  if (schema.length === 0) return;  // game has no achievements → nothing to do

  // build a lookup: apiName → { achieved, unlocktime }
  const unlockMap = new Map(playerAch.map((a: any) => [a.apiname, a]));

  for (const def of schema) {
    // upsert the catalog definition (shared), keyed on @@unique([appId, apiName])
    const catalog = await prisma.steamAchievementCatalog.upsert({
      where: { appId_apiName: { appId, apiName: def.name } },
      create: {
        appId,
        apiName: def.name,
        displayName: def.displayName,
        description: def.description ?? null,
        iconUrl: def.icon,
        iconGrayUrl: def.icongray,
        hidden: def.hidden === 1,
      },
      update: { displayName: def.displayName, iconUrl: def.icon, iconGrayUrl: def.icongray },
    });

    // upsert this user's unlock state, keyed on @@unique([linkedAccountId, achievementCatalogId])
    const player = unlockMap.get(def.name);
    await prisma.steamAchievement.upsert({
      where: {
        linkedAccountId_achievementCatalogId: {
          linkedAccountId,
          achievementCatalogId: catalog.id,
        },
      },
      create: {
        linkedAccountId,
        achievementCatalogId: catalog.id,
        unlocked: player?.achieved === 1,
        unlockedAt: player?.unlocktime ? new Date(player.unlocktime * 1000) : null,
      },
      update: {
        unlocked: player?.achieved === 1,
        unlockedAt: player?.unlocktime ? new Date(player.unlocktime * 1000) : null,
      },
    });
  }
}

export const steamSyncService = { syncAccount };


*/ 