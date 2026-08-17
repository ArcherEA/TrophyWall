import { assetUrl } from './asset-url.js';
import type { SteamStoreItemAssets, SteamGlobalAchievementPercent } from './steam.types.js';

const MEDIA_CDN = 'https://media.steampowered.com/steamcommunity/public/images/apps';

/** Builds the catalog image URLs for a game from its owned-game icon hash + store assets. */
export function buildImages(
  appId: number,
  imgIconUrl: string | undefined,
  assets?: SteamStoreItemAssets,
) {
  const fmt = assets?.asset_url_format;
  return {
    iconUrl: imgIconUrl ? `${MEDIA_CDN}/${appId}/${imgIconUrl}.jpg` : null,
    headerUrl: assetUrl(fmt, assets?.header),
    capsuleUrl: assetUrl(fmt, assets?.main_capsule),
    libraryCoverUrl: assetUrl(fmt, assets?.library_capsule),
  };
}

/**
 * Maps global achievement rarity by apiName. Steam returns `percent` as a
 * string, so it's coerced to a number and any non-numeric value is dropped.
 */
export function buildRarityMap(globals: SteamGlobalAchievementPercent[]): Map<string, number> {
  return new Map(
    globals.map((g) => [g.name, Number(g.percent)] as const).filter(([, p]) => Number.isFinite(p)),
  );
}

/** Steam unlock time is unix seconds; convert to a Date (or null when never unlocked). */
export function toUnlockedAt(unlocktime: number | undefined | null): Date | null {
  return unlocktime ? new Date(unlocktime * 1000) : null;
}
