import type { Prisma } from '../generated/prisma/client.js';
import { prisma } from '../lib/prisma.js';
import { zzzClient } from '../zzz/zzz.client.js';
import { getZZZStore, getWeaponTooltip } from '../zzz/zzz.store.js';
import { transformZZZAgent, stripTooltipTags } from '../zzz/zzz-transform.js';
import type { ZZZWEngineEffect } from '../zzz/zzz-transform.js';
import { config } from '../config/env.js';
import { logger } from '../lib/logger.js';

async function syncZZZAccount(linkedAccountId: string) {
  const account = await prisma.linkedAccounts.findUniqueOrThrow({ where: { id: linkedAccountId } });
  const [{ agents, profile }, store] = await Promise.all([
    zzzClient.getZZZUser(account.externalId),
    getZZZStore(),
  ]);

  // refresh nickname + avatar (the profile picture is an agent's circle icon)
  const pfp = profile.AvatarId != null ? store.avatars[String(profile.AvatarId)] : undefined;
  const avatarUrl = pfp?.CircleIcon ? `${config.zzzImageBase}${pfp.CircleIcon}` : account.avatarUrl;
  await prisma.linkedAccounts.update({
    where: { id: account.id },
    data: { displayName: profile.Nickname ?? account.displayName, avatarUrl },
  });

  const currentAvatarIds: number[] = [];
  let synced = 0;

  for (const rawAgent of agents) {
    try {
      // resolve the equipped W-Engine's signature effect at its phase (best-effort)
      let effect: ZZZWEngineEffect | undefined;
      const w = rawAgent.Weapon;
      if (w) {
        const tip = await getWeaponTooltip(w.Id);
        const talent = tip?.Talents?.[String(w.UpgradeLevel)];
        if (talent) {
          effect = {
            name: stripTooltipTags(talent.Title),
            description: stripTooltipTags(talent.Description),
          };
        }
      }

      const { agent, discs } = transformZZZAgent(rawAgent, store, effect);
      currentAvatarIds.push(agent.avatarId);

      const saved = await prisma.zZZAgent.upsert({
        where: { linkedAccountId_avatarId: { linkedAccountId, avatarId: agent.avatarId } },
        create: { linkedAccountId, ...agent },
        update: { ...agent, updatedAt: new Date() },
      });

      // discs change often — replace them wholesale
      await prisma.zZZDriveDisc.deleteMany({ where: { zzzAgentId: saved.id } });
      await prisma.zZZDriveDisc.createMany({
        data: discs.map((d) => ({
          zzzAgentId: saved.id,
          slot: d.slot,
          setName: d.setName,
          rarity: d.rarity,
          level: d.level,
          iconUrl: d.iconUrl,
          mainStat: d.mainStat as unknown as Prisma.InputJsonValue,
          subStats: d.subStats as unknown as Prisma.InputJsonValue,
        })),
      });
      synced++;
    } catch (err) {
      logger.error({ err, avatarId: rawAgent.Id }, 'zzz agent sync failed');
    }
  }

  // drop agents no longer in the showcase
  await prisma.zZZAgent.deleteMany({
    where: { linkedAccountId, avatarId: { notIn: currentAvatarIds } },
  });
  await prisma.linkedAccounts.update({
    where: { id: account.id },
    data: { lastSyncedAt: new Date() },
  });

  return { charactersSynced: synced };
}

export const zzzSyncService = { syncZZZAccount };
