// HSR icons on enka.network: char round-icons (PNG) and light-cone figures (JPG).
// Base default: https://enka.network/ui/hsr/SpriteOutput

export function hsrCharIcon(base: string, avatarId: number | null | undefined): string | null {
  if (avatarId == null) return null;
  return `${base}/AvatarRoundIcon/${avatarId}.png`;
}

export function hsrLightConeIcon(
  base: string,
  lightConeId: number | null | undefined,
): string | null {
  if (lightConeId == null) return null;
  return `${base}/LightConeFigures/${lightConeId}.jpg`;
}

// Enka relicData.type → friendly slot name
const SLOT_MAP: Record<string, string> = {
  HEAD: 'head',
  HAND: 'hands',
  BODY: 'body',
  FOOT: 'feet',
  NECK: 'sphere', // Planar Sphere
  OBJECT: 'rope', // Link Rope
};

export function hsrSlotName(type: string): string {
  return SLOT_MAP[type] ?? type.toLowerCase();
}
