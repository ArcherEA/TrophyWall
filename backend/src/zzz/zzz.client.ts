import { logger } from '../lib/logger.js';

// No npm library wraps ZZZ, so we hit Enka's public raw endpoint directly.
// Shape: { PlayerInfo: { ShowcaseDetail: { AvatarList }, SocialDetail: { ProfileDetail } } }
const ENKA_ZZZ = 'https://enka.network/api/zzz/uid';
const UA = 'TrophyWall/1.0 (+trophy-wall)';

export interface ZZZRawStat {
  PropertyId: number;
  PropertyLevel: number;
  PropertyValue: number;
}

export interface ZZZRawEquipment {
  Id: number;
  Level: number;
  BreakLevel: number;
  MainPropertyList: ZZZRawStat[];
  RandomPropertyList: ZZZRawStat[];
}

export interface ZZZRawAgent {
  Id: number;
  Level: number;
  PromotionLevel: number;
  TalentLevel: number; // mindscape / cinema 0-6
  CoreSkillEnhancement: number;
  WeaponEffectState?: number;
  Weapon?: { Id: number; Level: number; BreakLevel: number; UpgradeLevel: number };
  EquippedList: { Slot: number; Equipment: ZZZRawEquipment }[];
}

export interface ZZZProfileDetail {
  Nickname?: string;
  Level?: number;
  AvatarId?: number;
  ProfileId?: number;
  Title?: number;
}

export interface ZZZUser {
  agents: ZZZRawAgent[];
  profile: ZZZProfileDetail;
}

/** Fetch a ZZZ player's showcase (raw ids — resolve names/icons via the store). */
async function getZZZUser(uid: string): Promise<ZZZUser> {
  const res = await fetch(`${ENKA_ZZZ}/${uid}/`, { headers: { 'User-Agent': UA } });
  if (res.status === 404) {
    const err = new Error(`ZZZ UID not found: ${uid}`);
    (err as { status?: number }).status = 404;
    throw err;
  }
  if (!res.ok) {
    throw new Error(`enka zzz fetch failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as {
    PlayerInfo?: {
      ShowcaseDetail?: { AvatarList?: ZZZRawAgent[] };
      SocialDetail?: { ProfileDetail?: ZZZProfileDetail };
    };
  };
  const agents = json.PlayerInfo?.ShowcaseDetail?.AvatarList ?? [];
  const profile = json.PlayerInfo?.SocialDetail?.ProfileDetail ?? {};
  logger.info({ uid, agents: agents.length }, 'fetched ZZZ showcase');
  return { agents, profile };
}

export const zzzClient = { getZZZUser };
