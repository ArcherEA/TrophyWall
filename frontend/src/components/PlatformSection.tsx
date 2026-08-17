import type { ReactNode } from 'react';
import type { Profile } from '../api/types';
import { isSteamProfile, isGenshinProfile, isHSRProfile, isZZZProfile } from '../api/types';
import { GameWall } from './GameWall';
import { StatsBar } from './StatsBar';
import { GenshinShowcase } from './GenshinShowcase';
import { HSRShowcase } from './HSRShowcase';
import { ZZZShowcase } from './ZZZShowcase';
import { PlatformIcon } from './PlatformIcon';
import { computeStats } from '../lib/stats';

const PLATFORM_LABEL: Record<string, string> = {
  STEAM: 'Steam',
  GENSHIN: 'Genshin Impact',
  HSR: 'Honkai: Star Rail',
  ZZZ: 'Zenless Zone Zero',
};

/** One linked account rendered as a labelled section (header + platform showcase). */
export function PlatformSection({ profile }: { profile: Profile }) {
  const { platform, displayName, externalId, avatar } = profile.account;
  const label = PLATFORM_LABEL[platform] ?? platform;

  let subtitle = '';
  let body: ReactNode = null;

  if (isSteamProfile(profile)) {
    const s = computeStats(profile.games);
    subtitle = `${s.gameCount} games · ${s.hours.toLocaleString()}h played · ${s.overall}% overall`;
    body =
      profile.games.length > 0 ? (
        <>
          <StatsBar games={profile.games} />
          <GameWall games={profile.games} />
        </>
      ) : (
        <p className="text-white/40">No games synced.</p>
      );
  } else if (isGenshinProfile(profile)) {
    subtitle = `${profile.characters.length} characters`;
    body = <GenshinShowcase characters={profile.characters} />;
  } else if (isHSRProfile(profile)) {
    subtitle = `${profile.characters.length} characters`;
    body = <HSRShowcase characters={profile.characters} />;
  } else if (isZZZProfile(profile)) {
    subtitle = `${profile.characters.length} agents`;
    body = <ZZZShowcase characters={profile.characters} />;
  }

  return (
    <section className="mb-14">
      <div className="mb-5 flex items-center gap-3 border-b border-white/10 pb-3">
        <PlatformIcon
          platform={platform}
          className="h-9 w-9 rounded-lg object-cover ring-1 ring-white/15"
        />
        {avatar && (
          <img
            src={avatar}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20"
          />
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-white">{label}</h2>
          <p className="truncate text-xs text-white/50">
            {displayName ?? externalId} · {subtitle}
          </p>
        </div>
      </div>
      {body}
    </section>
  );
}
