// Enka equipType → friendly artifact slot name
const SLOT_MAP: Record<string, string> = {
  EQUIP_BRACER: 'flower', // Flower of Life
  EQUIP_NECKLACE: 'plume', // Plume of Death
  EQUIP_SHOES: 'sands', // Sands of Eon
  EQUIP_RING: 'goblet', // Goblet of Eonothem
  EQUIP_DRESS: 'circlet', // Circlet of Logos
};

export function slotName(equipType: string): string {
  return SLOT_MAP[equipType] ?? equipType;
}

// element name (e.g. "Cryo") → the matching damage-bonus stat key on CharacterStats
export const ELEMENT_DAMAGE_STAT: Record<string, string> = {
  Pyro: 'pyroDamage',
  Hydro: 'hydroDamage',
  Electro: 'electroDamage',
  Cryo: 'cryoDamage',
  Anemo: 'anemoDamage',
  Geo: 'geoDamage',
  Dendro: 'dendroDamage',
};
