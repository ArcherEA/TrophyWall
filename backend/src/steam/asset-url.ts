const STEAM_ASSET_CDN = 'https://shared.akamai.steamstatic.com/store_item_assets';

/**
 * Builds a full Steam store asset URL from the `asset_url_format` template
 * (e.g. "steam/apps/1580790/${FILENAME}?t=123") and an asset filename
 * (e.g. "header.jpg"). Returns null if either input is missing.
 */
export function assetUrl(
  format: string | undefined,
  filename: string | undefined,
): string | null {
  if (!format || !filename) return null;
  return `${STEAM_ASSET_CDN}/${format.replace('${FILENAME}', filename)}`;
}
