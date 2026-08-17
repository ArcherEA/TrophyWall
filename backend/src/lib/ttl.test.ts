import { describe, it, expect } from 'vitest';
import { isStale } from './ttl.js';

const TTL = 1000 * 60 * 60 * 24 * 30; // 30 days
const NOW = new Date('2026-01-31T00:00:00Z').getTime();

describe('isStale', () => {
  it('is stale when never fetched', () => {
    expect(isStale(null, TTL, NOW)).toBe(true);
    expect(isStale(undefined, TTL, NOW)).toBe(true);
  });

  it('is fresh when fetched within the TTL', () => {
    const oneDayAgo = new Date(NOW - 1000 * 60 * 60 * 24);
    expect(isStale(oneDayAgo, TTL, NOW)).toBe(false);
  });

  it('is stale when older than the TTL', () => {
    const longAgo = new Date(NOW - TTL - 1000);
    expect(isStale(longAgo, TTL, NOW)).toBe(true);
  });

  it('is not stale exactly at the TTL boundary', () => {
    const exactly = new Date(NOW - TTL);
    expect(isStale(exactly, TTL, NOW)).toBe(false);
  });
});
