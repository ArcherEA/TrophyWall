import { describe, it, expect } from 'vitest';
import { buildImages, buildRarityMap, toUnlockedAt } from './sync-transforms.js';

describe('buildImages', () => {
  it('builds the icon from the media CDN and assets from the url format', () => {
    const imgs = buildImages(730, 'abc123', {
      asset_url_format: 'steam/apps/730/${FILENAME}?t=1',
      header: 'header.jpg',
      main_capsule: 'capsule_616x353.jpg',
      library_capsule: 'library_600x900.jpg',
    });
    expect(imgs.iconUrl).toBe(
      'https://media.steampowered.com/steamcommunity/public/images/apps/730/abc123.jpg',
    );
    expect(imgs.headerUrl).toContain('/steam/apps/730/header.jpg?t=1');
    expect(imgs.capsuleUrl).toContain('capsule_616x353.jpg');
    expect(imgs.libraryCoverUrl).toContain('library_600x900.jpg');
  });

  it('returns nulls when there is no icon hash and no asset format', () => {
    const imgs = buildImages(730, undefined, undefined);
    expect(imgs.iconUrl).toBeNull();
    expect(imgs.headerUrl).toBeNull();
    expect(imgs.libraryCoverUrl).toBeNull();
  });
});

describe('buildRarityMap', () => {
  it('coerces string percents to numbers keyed by apiName', () => {
    const map = buildRarityMap([
      { name: 'WIN', percent: '12.5' as unknown as number },
      { name: 'RARE', percent: '0.4' as unknown as number },
    ]);
    expect(map.get('WIN')).toBe(12.5);
    expect(map.get('RARE')).toBe(0.4);
  });

  it('drops entries whose percent is not a finite number', () => {
    const map = buildRarityMap([
      { name: 'OK', percent: '5' as unknown as number },
      { name: 'BAD', percent: 'n/a' as unknown as number },
    ]);
    expect(map.get('OK')).toBe(5);
    expect(map.has('BAD')).toBe(false);
  });

  it('returns an empty map for no input', () => {
    expect(buildRarityMap([]).size).toBe(0);
  });
});

describe('toUnlockedAt', () => {
  it('converts unix seconds to a Date', () => {
    expect(toUnlockedAt(1_700_000_000)).toEqual(new Date(1_700_000_000 * 1000));
  });

  it('returns null when never unlocked (0/undefined/null)', () => {
    expect(toUnlockedAt(0)).toBeNull();
    expect(toUnlockedAt(undefined)).toBeNull();
    expect(toUnlockedAt(null)).toBeNull();
  });
});
