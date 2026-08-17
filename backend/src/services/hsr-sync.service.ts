import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { starrailClient } from '../hsr/starrail.client.js';
import { transformHSRCharacter } from '../hsr/hsr-transform.js';
import { logger } from '../lib/logger.js';

async function syncHSRAccount(linkedAccountId: string) {
  const account = await prisma.linkedAccounts.findUniqueOrThrow({ where: { id: linkedAccountId } });
  const user = await starrailClient.getHSRUser(account.externalId);

  // refresh nickname + avatar (best-effort)
  let avatarUrl = account.avatarUrl;
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- user icon shape varies
    const u = user as any;
    avatarUrl = u.icon?.icon?.url ?? u.icon?.url ?? account.avatarUrl;
  } catch {
    /* keep existing avatar */
  }
  await prisma.linkedAccounts.update({
    where: { id: account.id },
    data: { displayName: user.nickname ?? account.displayName, avatarUrl },
  });

  const chars = user.getCharacters();
  const currentAvatarIds: number[] = [];
  let synced = 0;

  for (const libChar of chars) {
    try {
      const { character, relics } = transformHSRCharacter(libChar);
      currentAvatarIds.push(character.avatarId);

      const saved = await prisma.hSRCharacter.upsert({
        where: { linkedAccountId_avatarId: { linkedAccountId, avatarId: character.avatarId } },
        create: { linkedAccountId, ...character, stats: character.stats as Prisma.InputJsonValue },
        update: {
          ...character,
          stats: character.stats as Prisma.InputJsonValue,
          updatedAt: new Date(),
        },
      });

      await prisma.hSRRelic.deleteMany({ where: { hsrCharacterId: saved.id } });
      await prisma.hSRRelic.createMany({
        data: relics.map((r) => ({
          hsrCharacterId: saved.id,
          slot: r.slot,
          setName: r.setName,
          rarity: r.rarity,
          level: r.level,
          iconUrl: r.iconUrl,
          mainStat: r.mainStat as unknown as Prisma.InputJsonValue,
          subStats: r.subStats as unknown as Prisma.InputJsonValue,
        })),
      });
      synced++;
    } catch (err) {
      logger.error({ err, avatarId: libChar.characterData?.id }, 'hsr character sync failed');
    }
  }

  await prisma.hSRCharacter.deleteMany({
    where: { linkedAccountId, avatarId: { notIn: currentAvatarIds } },
  });
  await prisma.linkedAccounts.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date() },
  });

  return { charactersSynced: synced };
}

export const hsrSyncService = { syncHSRAccount };
