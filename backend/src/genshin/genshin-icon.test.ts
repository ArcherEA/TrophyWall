import { describe, it, expect } from 'vitest';
import { buildIconUrl } from './genshin-icon.js';

const BASE = 'https://enka.network/ui';

describe('buildIconUrl', () => {
  it('builds a .png URL from the icon name against the base', () => {
    expect(buildIconUrl(BASE, 'UI_AvatarIcon_Ayaka')).toBe(
      'https://enka.network/ui/UI_AvatarIcon_Ayaka.png',
    );
  });

  it('returns null when the name is missing', () => {
    expect(buildIconUrl(BASE, null)).toBeNull();
    expect(buildIconUrl(BASE, undefined)).toBeNull();
  });
});
