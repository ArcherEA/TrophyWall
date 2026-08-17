import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { enkaClient } from '../genshin/enka.client.js';
import { transformCharacter } from '../genshin/genshin-transform.js';
import { buildIconUrl } from '../genshin/genshin-icon.js';
import { config } from '../config/env.js';
import { logger } from '../lib/logger.js';

async function syncGenshinAccount(linkedAccountId: string) {
  const account = await prisma.linkedAccounts.findUniqueOrThrow({ where: { id: linkedAccountId } });
  const user = await enkaClient.getGenshinUser(account.externalId);

  // refresh account profile (nickname + profile picture, best-effort)
  let avatarUrl = account.avatarUrl;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- profile picture shape varies
    const iconName = (user as any).profilePicture?.icon?.name as string | undefined;
    avatarUrl = buildIconUrl(config.genshinImageBase, iconName) ?? account.avatarUrl;
  } catch {
    /* keep existing avatar */
  }
  await prisma.linkedAccounts.update({
    where: { id: account.id },
    data: { displayName: user.nickname ?? account.displayName, avatarUrl },
  });

  const currentAvatarIds: number[] = [];
  let synced = 0;

  for (const libChar of user.characters) {
    try {
      const { character, artifacts } = transformCharacter(libChar);
      currentAvatarIds.push(character.avatarId);

      const saved = await prisma.genshinCharacter.upsert({
        where: { linkedAccountId_avatarId: { linkedAccountId, avatarId: character.avatarId } },
        create: {
          linkedAccountId,
          ...character,
          stats: character.stats as Prisma.InputJsonValue,
        },
        update: {
          ...character,
          stats: character.stats as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
      });

      // artifacts change often — replace them wholesale
      await prisma.genshinArtifact.deleteMany({ where: { genshinCharacterId: saved.id } });
      await prisma.genshinArtifact.createMany({
        data: artifacts.map((a) => ({
          genshinCharacterId: saved.id,
          slot: a.slot,
          setName: a.setName,
          rarity: a.rarity,
          level: a.level,
          iconUrl: a.iconUrl,
          mainStat: a.mainStat as unknown as Prisma.InputJsonValue,
          subStats: a.subStats as unknown as Prisma.InputJsonValue,
        })),
      });
      synced++;
    } catch (err) {
      logger.error({ err, avatarId: libChar.characterData?.id }, 'genshin character sync failed');
    }
  }

  // drop characters no longer in the showcase
  await prisma.genshinCharacter.deleteMany({
    where: { linkedAccountId, avatarId: { notIn: currentAvatarIds } },
  });

  await prisma.linkedAccounts.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date() },
  });

  return { charactersSynced: synced };
}

export const genshinSyncService = { syncGenshinAccount };
