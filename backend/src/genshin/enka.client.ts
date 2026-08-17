import { EnkaClient } from 'enka-network-api';
import { logger } from '../lib/logger.js';

const enka = new EnkaClient({ userAgent: 'TrophyWall/1.0 (+trophy-wall)' });

let ready: Promise<void> | null = null;

/**
 * Ensures Enka's game-data cache is present (≈ tens of MB, downloaded once per process).
 * Memoized so concurrent callers share a single download.
 */
function ensureReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await enka.cachedAssetsManager.cacheDirectorySetup();
      const hasAll = await enka.cachedAssetsManager.hasAllContents();
      if (!hasAll) {
        logger.info('downloading Enka game-data cache…');
        await enka.cachedAssetsManager.fetchAllContents();
        logger.info('Enka game-data cache ready');
      }
    })();
  }
  return ready;
}

/** Fetch a Genshin user's showcase (resolved characters, weapons, artifacts). */
export async function getGenshinUser(uid: string) {
  await ensureReady();
  return enka.fetchUser(uid);
}

export const enkaClient = { getGenshinUser };
