export interface Profile {
    account: { steamId: string; displayName: string | null; lastSyncedAt: string| null };
    games: Game[];
}

export interface Game {
    appId: number;
    name: string;
    playtimeForever: number;          // minutes
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
  icon: string | null;              // already colored/gray from backend
  hidden: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

export interface LinkedAccount {
  id: string;
  externalId: string;
  displayName: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
}