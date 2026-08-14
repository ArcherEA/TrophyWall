import { config } from "../config/env.js";
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

async function getPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null> {
    const url = `${config.steamApiUrl}/ISteamUser/GetPlayerSummaries/v2/`
        + `?key=${config.steamApiKey}&steamids=${steamId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getPlayerSummary ${res.status}`);
    const json = await res.json() as { response: { players: SteamPlayerSummary[] } };
    return json.response.players?.[0] ?? null;
}

async function getSteamId(vanityUrl: string): Promise<string | null> {
    const url = `${config.steamApiUrl}/ISteamUser/ResolveVanityURL/v1/`
        + `?key=${config.steamApiKey}&vanityurl=${vanityUrl}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getSteamId ${res.status}`);
    const json = await res.json() as { response: SteamVanityResolve };
    return json.response.success === 1 ? json.response.steamid ?? null : null;
}

async function getOwnedGames(steamId: string): Promise<SteamOwnedGame[]> {
    const url = `${config.steamApiUrl}/IPlayerService/GetOwnedGames/v1/`
        + `?key=${config.steamApiKey}&steamid=${steamId}`
        + `&format=json&include_appinfo=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getOwnedGames ${res.status}`);
    const json = await res.json() as { response: { games?: SteamOwnedGame[] } };
    return json.response.games ?? [];
}

async function getSchemaForGame(appId: string, l: string = 'schinese'): Promise<SteamGameSchema | null> {
    const url = `${config.steamApiUrl}/ISteamUserStats/GetSchemaForGame/v2/`
        + `?key=${config.steamApiKey}&appid=${appId}`
        + `&l=${l}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getSchemaForGame ${res.status}`);
    // FIX: GetSchemaForGame returns `{ game: {...} }`, no `response` wrapper
    const json = await res.json() as { game?: SteamGameSchema };
    return json.game ?? null;
}

async function getGlobalAchievementPercentages(gameId: string): Promise<SteamGlobalAchievementPercent[]> {
    // FIX: the query param is `gameid` (lowercase), not `gameId`
    const url = `${config.steamApiUrl}/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/`
        + `?gameid=${gameId}`
        + `&format=json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getGlobalAchievementPercentages ${res.status}`);
    const json = await res.json() as {
        achievementpercentages?: { achievements: SteamGlobalAchievementPercent[] };
    };
    return json.achievementpercentages?.achievements ?? [];
}

async function getPlayerAchievements(steamId: string, appId: string, l: string = 'schinese'): Promise<SteamPlayerStats | null> {
    const url = `${config.steamApiUrl}/ISteamUserStats/GetPlayerAchievements/v1/`
        + `?key=${config.steamApiKey}&steamid=${steamId}&appid=${appId}`
        + `&format=json&l=${l}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getPlayerAchievements ${res.status}`);
    const json = await res.json() as { playerstats?: SteamPlayerStats };
    return json.playerstats ?? null;
}

async function getRecentPlayedGames(steamId: string, count: number): Promise<SteamRecentGame[]> {
    const url = `${config.steamApiUrl}/IPlayerService/GetRecentlyPlayedGames/v1/`
        + `?key=${config.steamApiKey}&steamid=${steamId}&count=${count}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getRecentPlayedGames ${res.status}`);
    const json = await res.json() as { response: { games?: SteamRecentGame[] } };
    return json.response.games ?? [];
}

async function getGameAssetImages(ids: string, l: string = 'schinese', countryCode: string = 'US'): Promise<SteamStoreItem[]> {
    // Build the input_json payload and encode it as a single query value
    const inputJson = JSON.stringify({
        ids: [{ appid: Number(ids) }],
        context: { language: l, country_code: countryCode },
        data_request: { include_assets: true },
    });
    const url = `${config.steamApiUrl}/IStoreBrowseService/GetItems/v1/`
        + `?key=${config.steamApiKey}`
        + `&input_json=${encodeURIComponent(inputJson)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`getGameAssetImages ${res.status}`);
    // FIX: was `json.reponse` (typo) — should be `response`
    const json = await res.json() as { response?: { store_items?: SteamStoreItem[] } };
    return json.response?.store_items ?? [];
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
