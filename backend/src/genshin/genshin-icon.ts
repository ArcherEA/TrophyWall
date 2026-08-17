/**
 * Builds a Genshin icon URL from the resolved asset name (e.g. "UI_AvatarIcon_Ayaka")
 * against a configurable CDN base. Kept pure (base passed in) so it's easy to test.
 */
export function buildIconUrl(base: string, name: string | null | undefined): string | null {
  if (!name) return null;
  return `${base}/${name}.png`;
}
