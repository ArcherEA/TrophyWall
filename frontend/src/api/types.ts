export type Platform = 'STEAM' | 'GENSHIN' | 'HSR' | 'ZZZ';

interface AccountBase {
  externalId: string;
  displayName: string | null;
  avatar: string | null;
  lastSyncedAt: string | null;
}

export interface SteamProfile {
  account: AccountBase & { platform: 'STEAM' };
  games: Game[];
}

export interface GenshinProfile {
  account: AccountBase & { platform: 'GENSHIN' };
  characters: GenshinCharacter[];
}

export interface HSRProfile {
  account: AccountBase & { platform: 'HSR' };
  characters: HSRCharacter[];
}

export interface ZZZProfile {
  account: AccountBase & { platform: 'ZZZ' };
  characters: ZZZAgent[];
}

export type Profile = SteamProfile | GenshinProfile | HSRProfile | ZZZProfile;

export function isSteamProfile(p: Profile): p is SteamProfile {
  return p.account.platform === 'STEAM';
}
export function isGenshinProfile(p: Profile): p is GenshinProfile {
  return p.account.platform === 'GENSHIN';
}
export function isHSRProfile(p: Profile): p is HSRProfile {
  return p.account.platform === 'HSR';
}
export function isZZZProfile(p: Profile): p is ZZZProfile {
  return p.account.platform === 'ZZZ';
}

export interface HSRStat {
  key: string; // raw StatPropertyType, e.g. "HPDelta" — labeled on the frontend
  value: number;
  isPercent: boolean;
  name: string | null;
}

export interface HSRRelic {
  id: string;
  slot: string; // head | hands | body | feet | sphere | rope
  setName: string;
  rarity: number;
  level: number;
  iconUrl: string | null;
  mainStat: HSRStat;
  subStats: HSRStat[];
}

export interface HSRCharacter {
  id: string;
  avatarId: number;
  name: string;
  path: string | null;
  element: string | null;
  rarity: number;
  level: number;
  eidolon: number;
  iconUrl: string | null;
  lightConeName: string | null;
  lightConeIconUrl: string | null;
  lightConeLevel: number | null;
  lightConeSuperimpose: number | null;
  lightConeRarity: number | null;
  stats: Record<string, number | null>;
  relics: HSRRelic[];
}

export interface GenshinStat {
  key: string;
  value: number;
  isPercent: boolean;
  name: string | null;
}

export interface GenshinArtifact {
  id: string;
  slot: string; // flower | plume | sands | goblet | circlet
  setName: string;
  rarity: number;
  level: number;
  iconUrl: string | null;
  mainStat: GenshinStat;
  subStats: GenshinStat[];
}

export interface GenshinCharacter {
  id: string;
  avatarId: number;
  name: string;
  element: string | null;
  rarity: number;
  level: number;
  constellation: number;
  friendship: number | null;
  iconUrl: string | null;
  talentNormal: number | null;
  talentSkill: number | null;
  talentBurst: number | null;
  weaponName: string | null;
  weaponIconUrl: string | null;
  weaponLevel: number | null;
  weaponRefinement: number | null;
  weaponRarity: number | null;
  stats: Record<string, number | null>;
  artifacts: GenshinArtifact[];
}

export interface ZZZStat {
  key: string; // raw property Name, e.g. "CritDmg"
  label: string; // friendly label resolved on the backend
  value: number; // final display number (percent as 48.0, flat as 2200)
  isPercent: boolean;
  rolls?: number; // substat upgrade count
}

export interface ZZZDisc {
  id: string;
  slot: number; // partition 1-6
  setName: string;
  rarity: string; // "S" | "A" | "B"
  level: number;
  iconUrl: string | null;
  mainStat: ZZZStat;
  subStats: ZZZStat[];
}

export interface ZZZAgent {
  id: string;
  avatarId: number;
  name: string;
  element: string | null; // Physical, Fire, Ice, Electric, Ether
  profession: string | null; // Attack, Stun, Anomaly, Support, Defense, Rupture
  rarity: string; // "S" | "A"
  level: number;
  mindscape: number; // 0-6
  accentColor: string | null;
  iconUrl: string | null;
  wEngineName: string | null;
  wEngineIconUrl: string | null;
  wEngineLevel: number | null;
  wEnginePhase: number | null;
  wEngineRarity: string | null;
  wEngineStatLabel: string | null; // advanced stat type, e.g. "CRIT Rate"
  wEngineEffectName: string | null; // signature effect title
  wEngineEffectDesc: string | null; // effect description at equipped phase
  discs: ZZZDisc[];
}

export interface Game {
  appId: number;
  name: string;
  playtimeForever: number; // minutes
  playtime2Weeks: number | null;
  images: {
    icon: string | null;
    header: string | null;
    capsule: string | null;
    libraryCover: string | null;
  };
  achievements: {
    total: number;
    unlocked: number;
    percent: number | null;
    items: Achievement[];
  };
}

export interface Achievement {
  apiName: string;
  displayName: string;
  description: string | null;
  icon: string | null; // already colored/gray from backend
  hidden: number;
  globalPercent: number | null; // global rarity % (fraction of players who unlocked it)
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface LinkedAccount {
  id: string;
  platform: Platform;
  externalId: string;
  displayName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
}
