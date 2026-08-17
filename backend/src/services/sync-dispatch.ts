import { prisma } from '../lib/prisma.js';
import { steamSyncService } from './steam-sync.service.js';
import { genshinSyncService } from './genshin-sync.service.js';
import { hsrSyncService } from './hsr-sync.service.js';
import { zzzSyncService } from './zzz-sync.service.js';

/**
 * The single place that routes a sync to the right per-platform service.
 * Each platform's sync logic lives in its own module; this only dispatches.
 */
export async function dispatchSync(
  linkedAccountId: string,
  onProgress?: (done: number, total: number) => void,
) {
  const { platform } = await prisma.linkedAccounts.findUniqueOrThrow({
    where: { id: linkedAccountId },
    select: { platform: true },
  });

  switch (platform) {
    case 'STEAM':
      return steamSyncService.syncAccount(linkedAccountId, onProgress);
    case 'GENSHIN':
      return genshinSyncService.syncGenshinAccount(linkedAccountId);
    case 'HSR':
      return hsrSyncService.syncHSRAccount(linkedAccountId);
    case 'ZZZ':
      return zzzSyncService.syncZZZAccount(linkedAccountId);
    default:
      throw new Error(`unsupported platform: ${platform}`);
  }
}
