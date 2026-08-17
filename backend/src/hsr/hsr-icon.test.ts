import { describe, it, expect } from 'vitest';
import { hsrCharIcon, hsrLightConeIcon, hsrSlotName } from './hsr-icon.js';

const BASE = 'https://enka.network/ui/hsr/SpriteOutput';

describe('hsr icons', () => {
  it('builds the character round-icon URL (png)', () => {
    expect(hsrCharIcon(BASE, 1102)).toBe(`${BASE}/AvatarRoundIcon/1102.png`);
  });

  it('builds the light-cone figure URL (jpg)', () => {
    expect(hsrLightConeIcon(BASE, 24001)).toBe(`${BASE}/LightConeFigures/24001.jpg`);
  });

  it('returns null when the id is missing', () => {
    expect(hsrCharIcon(BASE, null)).toBeNull();
    expect(hsrLightConeIcon(BASE, undefined)).toBeNull();
  });
});

describe('hsrSlotName', () => {
  it('maps enka relic types to friendly slots', () => {
    expect(hsrSlotName('HEAD')).toBe('head');
    expect(hsrSlotName('NECK')).toBe('sphere');
    expect(hsrSlotName('OBJECT')).toBe('rope');
  });
});
