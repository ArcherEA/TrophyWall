import { StarRail } from 'starrail.js';
import { logger } from '../lib/logger.js';

const client = new StarRail({ userAgent: 'TrophyWall/1.0 (+trophy-wall)' });

let ready: Promise<void> | null = null;

/** Ensure the HSR game-data cache is present (downloaded once per process). */
function ensureReady(): Promise<void> {
  if (!ready) {
    ready = (async () => {
      await client.cachedAssetsManager.cacheDirectorySetup();
      if (!client.cachedAssetsManager.hasAllContents()) {
        logger.info('downloading HSR game-data cache…');
        await client.cachedAssetsManager.fetchAllContents({});
        logger.info('HSR game-data cache ready');
      }
    })();
  }
  return ready;
}

/** Fetch an HSR user's showcase (resolved characters, light cones, relics). */
export async function getHSRUser(uid: string) {
  await ensureReady();
  return client.fetchUser(uid);
}

export const starrailClient = { getHSRUser };
