import { describe, it, expect } from 'vitest';
import { slotName, ELEMENT_DAMAGE_STAT } from './genshin-slot.js';

describe('slotName', () => {
  it('maps Enka equip types to friendly slot names', () => {
    expect(slotName('EQUIP_BRACER')).toBe('flower');
    expect(slotName('EQUIP_NECKLACE')).toBe('plume');
    expect(slotName('EQUIP_SHOES')).toBe('sands');
    expect(slotName('EQUIP_RING')).toBe('goblet');
    expect(slotName('EQUIP_DRESS')).toBe('circlet');
  });

  it('passes through unknown equip types unchanged', () => {
    expect(slotName('EQUIP_WEIRD')).toBe('EQUIP_WEIRD');
  });
});

describe('ELEMENT_DAMAGE_STAT', () => {
  it('maps element names to their damage-bonus stat key', () => {
    expect(ELEMENT_DAMAGE_STAT.Cryo).toBe('cryoDamage');
    expect(ELEMENT_DAMAGE_STAT.Dendro).toBe('dendroDamage');
  });
});
