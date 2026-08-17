import { config } from '../config/env.js';
import type {
  SteamPlayerSummary,
  SteamVanityResolve,
  SteamOwnedGame,
  SteamRecentGame,
  SteamGameSchema,
  SteamGlobalAchievementPercent,
  SteamPlayerStats,
  SteamStoreItem,
} from './steam.types.js';
import Bottleneck from 'bottleneck';

const limiter = new Bottleneck({
  maxConcurrent: 1, // one call at a time
  minTime: Number(process.env.STEAM_MIN_TIME_MS ?? 500), // ≥500ms between calls → ~2/sec
});

// single throttled fetch used by every function
async function steamFetch<T>(url: string, label: string): Promise<T> {
  return limiter.schedule(async () => {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`${label} ${res.status}`);
    return res.json() as Promise<T>;
  });
}

async function getPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null> {
  const url =
    `${config.steamApiUrl}/ISteamUser/GetPlayerSummaries/v2/` +
    `?key=${config.steamApiKey}&steamids=${steamId}`;
  const res = await steamFetch<{ response: { players: SteamPlayerSummary[] } }>(
    url,
    'getPlayerSummary',
  );
  return res.response.players?.[0] ?? null;
}

async function getSteamId(vanityUrl: string): Promise<string | null> {
  const url =
    `${config.steamApiUrl}/ISteamUser/ResolveVanityURL/v1/` +
    `?key=${config.steamApiKey}&vanityurl=${vanityUrl}`;
  const res = await steamFetch<{ response: SteamVanityResolve }>(url, 'getSteamId');
  return res.response.success === 1 ? (res.response.steamid ?? null) : null;
}

async function getOwnedGames(steamId: string): Promise<SteamOwnedGame[]> {
  const url =
    `${config.steamApiUrl}/IPlayerService/GetOwnedGames/v1/` +
    `?key=${config.steamApiKey}&steamid=${steamId}` +
    `&format=json&include_appinfo=true`;
  const res = await steamFetch<{ response: { games?: SteamOwnedGame[] } }>(url, 'getOwnedGames');
  return res.response.games ?? [];
}

async function getSchemaForGame(
  appId: string,
  l: string = 'schinese',
): Promise<SteamGameSchema | null> {
  const url =
    `${config.steamApiUrl}/ISteamUserStats/GetSchemaForGame/v2/` +
    `?key=${config.steamApiKey}&appid=${appId}` +
    `&l=${l}`;
  const res = await steamFetch<{ game?: SteamGameSchema }>(url, 'getSchemaForGame');
  return res.game ?? null;
}

async function getGlobalAchievementPercentages(
  gameId: string,
): Promise<SteamGlobalAchievementPercent[]> {
  // FIX: the query param is `gameid` (lowercase), not `gameId`
  const url =
    `${config.steamApiUrl}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/` +
    `?gameid=${gameId}` +
    `&format=json`;
  const res = await steamFetch<{
    achievementpercentages?: { achievements: SteamGlobalAchievementPercent[] };
  }>(url, 'getGlobalAchievementPercentages');

  return res.achievementpercentages?.achievements ?? [];
}

async function getPlayerAchievements(
  steamId: string,
  appId: string,
  l: string = 'schinese',
): Promise<SteamPlayerStats | null> {
  const url =
    `${config.steamApiUrl}/ISteamUserStats/GetPlayerAchievements/v1/` +
    `?key=${config.steamApiKey}&steamid=${steamId}&appid=${appId}` +
    `&format=json&l=${l}`;
  const res = await steamFetch<{ playerstats?: SteamPlayerStats }>(url, 'getPlayerAchievements');
  return res.playerstats ?? null;
}

async function getRecentPlayedGames(steamId: string, count: number): Promise<SteamRecentGame[]> {
  const url =
    `${config.steamApiUrl}/IPlayerService/GetRecentlyPlayedGames/v1/` +
    `?key=${config.steamApiKey}&steamid=${steamId}&count=${count}`;
  const res = await steamFetch<{ response: { games?: SteamRecentGame[] } }>(
    url,
    'getRecentPlayedGames',
  );

  return res.response.games ?? [];
}

async function getGameAssetImages(
  appIds: number[],
  l: string = 'schinese',
  countryCode: string = 'US',
): Promise<SteamStoreItem[]> {
  // Build the input_json payload and encode it as a single query value
  if (appIds.length === 0) return [];
  const inputJson = JSON.stringify({
    ids: appIds.map((appid) => ({ appid })),
    context: { language: l, country_code: countryCode },
    data_request: { include_assets: true },
  });

  const url =
    `${config.steamApiUrl}/IStoreBrowseService/GetItems/v1/` +
    `?key=${config.steamApiKey}` +
    `&input_json=${encodeURIComponent(inputJson)}`;
  const res = await steamFetch<{ response?: { store_items?: SteamStoreItem[] } }>(
    url,
    'getGameAssetImages',
  );

  return res.response?.store_items ?? [];
}

export const steamClient = {
  getPlayerSummary,
  getSteamId,
  getOwnedGames,
  getSchemaForGame,
  getGlobalAchievementPercentages,
  getPlayerAchievements,
  getRecentPlayedGames,
  getGameAssetImages,
};
