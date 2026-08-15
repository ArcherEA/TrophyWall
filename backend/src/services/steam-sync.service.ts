import { prisma } from '../lib/prisma.js';
import { steamClient } from '../steam/steam.client.js';
import { assetUrl } from '../steam/asset-url.js';
import type { SteamOwnedGame, SteamStoreItemAssets } from '../steam/steam.types.js';

const CATALOG_TTL_MS = 1000 * 60 * 60 * 24 * 30 ; //30 days
const ASSET_BATCH_SIZE = 50;
const MEDIA_CDN = 'https://media.steampowered.com/steamcommunity/public/images/apps';

async function syncAccount(linkedAccountId: string, onProgress?: (done: number, total: number) => void,) {
  const account = await prisma.linkedAccounts.findUniqueOrThrow({
    where: {
      id: linkedAccountId
    },
  });

  // refresh profile (display name + avatar) — keeps it current and backfills older accounts
  try {
    const summary = await steamClient.getPlayerSummary(account.externalId);
    if (summary) {
      await prisma.linkedAccounts.update({
        where: { id: account.id },
        data: { displayName: summary.personaname, avatarUrl: summary.avatarfull },
      });
    }
  } catch (err) {
    console.error(`[sync] profile refresh failed for ${account.id}`, err);
  }

  const games = await steamClient.getOwnedGames(account.externalId);

   // --- 1. one query: which of these games do we already have, and when fetched? ---
  const existing = await prisma.steamGameCatalog.findMany({
    where: { appId: { in: games.map((g) => g.appid) } },
    select: { appId: true, lastFetched: true },
  });
  const lastFetched = new Map(existing.map((c) => [c.appId, c.lastFetched]));

  const isStale = (appId: number) => {
    const lf = lastFetched.get(appId);
    return !lf || Date.now() - lf.getTime() > CATALOG_TTL_MS;
  };

  // --- 2. batch-fetch assets for the stale games only ---
  const staleAppIds = games.map((g) => g.appid).filter(isStale);
  const assetMap = await fetchAssetsBatched(staleAppIds);

  let synced = 0;
  for (const [i, game] of games.entries()) {
    try {
      await syncOneGame(
        account.id,
        account.externalId,
        game,
        lastFetched.has(game.appid), // exists?
        isStale(game.appid),         // stale?
        assetMap.get(game.appid),    // pre-fetched assets (may be undefined)
      );
      synced++;
    } catch (err) {
       // one bad game (private, no stats, transient error) must not kill the whole sync
      console.error(`[sync] failed for app ${game.name} appId: ${game.appid}`, err);
    }
    onProgress?.(i + 1, games.length);   // report after each game
  }

  await prisma.linkedAccounts.update({
    where: { id: account.id },
    data: { lastSyncedAt:new Date() },
  });

  return { gameSynced: synced, gamesTotal: games.length };
}

async function fetchAssetsBatched(appIds: number[]): Promise<Map<number, SteamStoreItemAssets>> {
  const map = new Map<number, SteamStoreItemAssets>();
  for (let i = 0; i < appIds.length; i += ASSET_BATCH_SIZE) {
    const batch = appIds.slice(i, i + ASSET_BATCH_SIZE);
    try {
      const items = await steamClient.getGameAssetImages(batch);
      for (const item of items) {
        if (item.assets) map.set(item.id, item.assets);
      }
    } catch (err) {
      console.error('[sync] asset batch failed', err); // one bad batch ≠ kill the sync
    }
  }
  return map;
}

function buildImages(appId: number, imgIconUrl: string | undefined, assets?: SteamStoreItemAssets) {
  const fmt = assets?.asset_url_format;
  return {
    iconUrl: imgIconUrl ? `${MEDIA_CDN}/${appId}/${imgIconUrl}.jpg` : null,
    headerUrl: assetUrl(fmt, assets?.header),
    capsuleUrl: assetUrl(fmt, assets?.main_capsule),
    libraryCoverUrl: assetUrl(fmt, assets?.library_capsule),
  };
}

async function syncOneGame(
  linkedAccountId: string,
  steamId: string,
  game: SteamOwnedGame,
  exists: boolean,
  stale: boolean,
  assets?: SteamStoreItemAssets,
) {
  const appId = game.appid;
  if (!exists) {
    await prisma.steamGameCatalog.create({ data: { appId, name: game.name } });
  }

  await prisma.steamGame.upsert({
    where: { linkedAccountId_appId: { linkedAccountId, appId } },
    create: {
      linkedAccountId, appId,
      playtimeForever: game.playtime_forever,
      playtime2Weeks: game.playtime_2weeks ?? null,
    },
    update: {
      playtimeForever: game.playtime_forever,
      playtime2Weeks: game.playtime_2weeks ?? null,
      lastSyncedAt: new Date(),
    },
  });

  if (stale) {
    await prisma.steamGameCatalog.update({
      where: { appId },
      data: { name: game.name, ...buildImages(appId, game.img_icon_url, assets) },
    });
    await refreshAchievementCatalog(appId); // sets lastFetched last
  }

  const achCount = await prisma.steamAchievementCatalog.count({ where: { appId } });
  if (achCount > 0) {
    await syncPlayerAchievements(linkedAccountId, steamId, appId);
  }
}

async function syncPlayerAchievements(linkedAccountId: string, steamId: string, appId: number) {
  const stats = await steamClient.getPlayerAchievements(steamId, String(appId));
  const unlocks = stats?.achievements ?? [];

  for (const pa of unlocks) {
    const catalog = await prisma.steamAchievementCatalog.findUnique({
      where: { appId_apiName: { appId, apiName: pa.apiname } },
    });
    if (!catalog) continue; // schema missing this one → skip

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
        unlocked: pa.achieved === 1,
        unlockedAt: pa.unlocktime ? new Date(pa.unlocktime * 1000) : null,
      },
      update: {
        unlocked: pa.achieved === 1,
        unlockedAt: pa.unlocktime ? new Date(pa.unlocktime * 1000) : null,
      },
    });
  }
}

async function refreshAchievementCatalog(appId: number) {
  const schema = await steamClient.getSchemaForGame(String(appId));
  const defs = schema?.availableGameStats?.achievements ?? [];

  // global rarity % (shared, per-achievement) — keyed by apiName; may fail for some games
  let rarity = new Map<string, number>();
  try {
    const globals = await steamClient.getGlobalAchievementPercentages(String(appId));
    // Steam returns `percent` as a string → coerce, and drop anything non-numeric
    rarity = new Map(
      globals
        .map((g) => [g.name, Number(g.percent)] as const)
        .filter(([, p]) => Number.isFinite(p)),
    );
  } catch (err) {
    console.error(`[sync] global % fetch failed for app ${appId}`, err);
  }

  for (const def of defs) {
    const globalPercent = rarity.get(def.name) ?? null;
    await prisma.steamAchievementCatalog.upsert({
      where: {appId_apiName: {appId, apiName: def.name}},
      create: {
        appId,
        apiName: def.name,
        displayName: def.displayName,
        description: def.description ?? null,
        iconUrl: def.icon,
        iconGrayUrl: def.icongray,
        hidden: def.hidden === 1,
        globalPercent,
      },
      update: {
        displayName: def.displayName,
        description: def.description ?? null,
        iconUrl: def.icon,
        iconGrayUrl: def.icongray,
        hidden: def.hidden === 1,
        globalPercent,
      },
    });
  }

  // mark this game's catalog as freshly fetched → resets the TTL
  await prisma.steamGameCatalog.update({
    where: {appId},
    data: {lastFetched: new Date()},
  })
}

export const steamSyncService = { syncAccount };