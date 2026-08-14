
// --- GetPlayerSummaries (ISteamUser) ---
export interface SteamPlayerSummary {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatarfull: string;
  communityvisibilitystate: number; // 1 = private, 3 = public
}

// --- ResolveVanityURL (ISteamUser) ---
export interface SteamVanityResolve {
  steamid?: string; // present only when success === 1
  success: number;  // 1 = resolved, 42 = no match
}

// --- GetOwnedGames (IPlayerService) ---
export interface SteamOwnedGame {
  appid: number;
  name: string;
  playtime_forever: number;
  playtime_2weeks?: number;
  img_icon_url?: string;
}

// --- GetRecentlyPlayedGames (IPlayerService) ---
export interface SteamRecentGame {
  appid: number;
  name: string;
  playtime_2weeks: number;
  playtime_forever: number;
  img_icon_url?: string;
}

// --- GetSchemaForGame (ISteamUserStats) ---
export interface SteamGameSchema {
  gameName: string;
  gameVersion: string;
  availableGameStats: {
    achievements?: SteamAchievementSchema[];
    stats?: SteamGameStat[];
  };
}

export interface SteamAchievementSchema {
  name: string;          // the internal apiName
  defaultvalue?: number;
  displayName: string;
  description?: string;
  icon: string;
  icongray: string;
  hidden: number;        // 0 or 1
}

export interface SteamGameStat {
  name: string;
  defaultvalue: number;
  displayName: string;
}

// --- GetGlobalAchievementPercentagesForApp (ISteamUserStats) ---
export interface SteamGlobalAchievementPercent {
  name: string;
  percent: number;
}

// --- GetPlayerAchievements (ISteamUserStats) ---
export interface SteamPlayerStats {
  steamID: string;
  gameName: string;
  achievements?: SteamPlayerAchievement[];
  success: boolean;
}

export interface SteamPlayerAchievement {
  apiname: string;
  achieved: number;      // 0 or 1
  unlocktime: number;    // unix seconds
  name?: string;         // present when a language (l) is requested
  description?: string;  // present when a language (l) is requested
}

// --- GetItems (IStoreBrowseService) ---
export interface SteamStoreItem {
  id: number;
  name: string;
  assets?: {
    asset_url_format?: string;
    header?: string;
    library_capsule?: string;
    library_hero?: string;
    [key: string]: string | undefined;
  };
}
