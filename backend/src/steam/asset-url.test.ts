import { describe, it, expect } from 'vitest';
import { assetUrl } from './asset-url.js';

describe('assetUrl', () => {
  it('substitutes ${FILENAME} into the format and prefixes the CDN', () => {
    expect(assetUrl('steam/apps/1580790/${FILENAME}?t=123', 'header.jpg')).toBe(
      'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1580790/header.jpg?t=123',
    );
  });

  it('returns null when the format is missing', () => {
    expect(assetUrl(undefined, 'header.jpg')).toBeNull();
  });

  it('returns null when the filename is missing', () => {
    expect(assetUrl('steam/apps/1/${FILENAME}', undefined)).toBeNull();
  });
});
