import { describe, it, expect, vi, beforeEach } from 'vitest';

// mock config so the client doesn't require real env vars
vi.mock('../config/env.js', () => ({
  config: {
    steamApiUrl: 'https://api.steampowered.com',
    steamApiKey: 'TESTKEY',
    databaseUrl: 'postgres://x',
    redisUrl: 'redis://x',
    port: 3001,
  },
}));

import { steamClient } from './steam.client.js';

function mockFetchOnce(json: unknown, { ok = true, status = 200 } = {}) {
  vi.mocked(fetch).mockResolvedValueOnce({
    ok,
    status,
    json: async () => json,
  } as unknown as Response);
}

// the URL passed to fetch on the Nth call
function calledUrl(n = 0): string {
  return vi.mocked(fetch).mock.calls[n][0] as string;
}

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn());
});

describe('getPlayerSummary', () => {
  it('hits GetPlayerSummaries and returns the first player', async () => {
    mockFetchOnce({ response: { players: [{ steamid: '1', personaname: 'Bob' }] } });
    const p = await steamClient.getPlayerSummary('76561198000000000');
    expect(p?.personaname).toBe('Bob');
    expect(calledUrl()).toContain('/ISteamUser/GetPlayerSummaries/v2/');
    expect(calledUrl()).toContain('steamids=76561198000000000');
    expect(calledUrl()).toContain('key=TESTKEY');
  });

  it('returns null when there are no players (invalid id)', async () => {
    mockFetchOnce({ response: { players: [] } });
    expect(await steamClient.getPlayerSummary('123')).toBeNull();
  });

  it('throws on a non-ok response', async () => {
    mockFetchOnce({}, { ok: false, status: 403 });
    await expect(steamClient.getPlayerSummary('123')).rejects.toThrow('getPlayerSummary 403');
  });
});

describe('getSteamId (ResolveVanityURL)', () => {
  it('returns the resolved id when success === 1', async () => {
    mockFetchOnce({ response: { success: 1, steamid: '76561198000000000' } });
    expect(await steamClient.getSteamId('gaben')).toBe('76561198000000000');
    expect(calledUrl()).toContain('/ISteamUser/ResolveVanityURL/v1/');
    expect(calledUrl()).toContain('vanityurl=gaben');
  });

  it('returns null on no-match (success === 42)', async () => {
    mockFetchOnce({ response: { success: 42 } });
    expect(await steamClient.getSteamId('nope')).toBeNull();
  });
});

describe('getOwnedGames', () => {
  it('requests appinfo and returns the games array', async () => {
    mockFetchOnce({ response: { games: [{ appid: 730, name: 'CS2' }] } });
    const games = await steamClient.getOwnedGames('123');
    expect(games).toHaveLength(1);
    expect(games[0].appid).toBe(730);
    expect(calledUrl()).toContain('include_appinfo=true'); // required for names/icons
  });

  it('returns [] when the account owns no games', async () => {
    mockFetchOnce({ response: {} });
    expect(await steamClient.getOwnedGames('123')).toEqual([]);
  });
});

describe('getSchemaForGame', () => {
  it('reads the top-level `game` field (no response wrapper) and passes the language', async () => {
    mockFetchOnce({ game: { gameName: 'CS2', availableGameStats: { achievements: [] } } });
    const schema = await steamClient.getSchemaForGame('730', 'english');
    expect(schema?.gameName).toBe('CS2');
    expect(calledUrl()).toContain('/ISteamUserStats/GetSchemaForGame/v2/');
    expect(calledUrl()).toContain('l=english');
  });

  it('returns null when the game has no schema', async () => {
    mockFetchOnce({});
    expect(await steamClient.getSchemaForGame('730')).toBeNull();
  });
});

describe('getGlobalAchievementPercentages', () => {
  it('uses the lowercase `gameid` param and returns the achievements array', async () => {
    mockFetchOnce({ achievementpercentages: { achievements: [{ name: 'WIN', percent: 12.5 }] } });
    const pcts = await steamClient.getGlobalAchievementPercentages('730');
    expect(pcts[0]).toEqual({ name: 'WIN', percent: 12.5 });
    expect(calledUrl()).toContain('gameid=730'); // NOT gameId
  });

  it('returns [] when there is no global data', async () => {
    mockFetchOnce({});
    expect(await steamClient.getGlobalAchievementPercentages('730')).toEqual([]);
  });
});

describe('getPlayerAchievements', () => {
  it('returns the playerstats object', async () => {
    mockFetchOnce({
      playerstats: { steamID: '1', gameName: 'CS2', achievements: [], success: true },
    });
    const stats = await steamClient.getPlayerAchievements('1', '730');
    expect(stats?.gameName).toBe('CS2');
    expect(calledUrl()).toContain('appid=730');
  });
});

describe('getGameAssetImages', () => {
  it('short-circuits (no fetch) when given no appids', async () => {
    const items = await steamClient.getGameAssetImages([]);
    expect(items).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('encodes an input_json payload with the appids and returns store_items', async () => {
    mockFetchOnce({ response: { store_items: [{ id: 730, name: 'CS2', assets: {} }] } });
    const items = await steamClient.getGameAssetImages([730, 570]);
    expect(items).toHaveLength(1);
    expect(calledUrl()).toContain('/IStoreBrowseService/GetItems/v1/');
    // the input_json is URI-encoded; decode and check both appids are present
    const decoded = decodeURIComponent(calledUrl());
    expect(decoded).toContain('"appid":730');
    expect(decoded).toContain('"appid":570');
  });
});
