/**
 * Returns true when a catalog entry needs re-fetching: either it was never
 * fetched (no timestamp) or its last fetch is older than the TTL.
 * `now` is injectable for deterministic tests.
 */
export function isStale(
  lastFetched: Date | null | undefined,
  ttlMs: number,
  now: number = Date.now(),
): boolean {
  if (!lastFetched) return true;
  return now - lastFetched.getTime() > ttlMs;
}
