import type { ReactNode } from 'react';
import type { Profile } from '../api/types';
import { isSteamProfile, isGenshinProfile, isHSRProfile, isZZZProfile } from '../api/types';
import { GameWall } from './GameWall';
import { StatsBar } from './StatsBar';
import { GenshinShowcase } from './GenshinShowcase';
import { HSRShowcase } from './HSRShowcase';
import { ZZZShowcase } from './ZZZShowcase';
import { computeStats } from '../lib/stats';

// Placeholder glyphs — swapped for real platform logos in Phase 3.
const PLATFORM_META: Record<string, { label: string; icon: string }> = {
  STEAM: { label: 'Steam', icon: '🎮' },
  GENSHIN: { label: 'Genshin Impact', icon: '⚔' },
  HSR: { label: 'Honkai: Star Rail', icon: '🚂' },
  ZZZ: { label: 'Zenless Zone Zero', icon: '🌀' },
};

/** One linked account rendered as a labelled section (header + platform showcase). */
export function PlatformSection({ profile }: { profile: Profile }) {
  const { platform, displayName, externalId, avatar } = profile.account;
  const meta = PLATFORM_META[platform] ?? { label: platform, icon: '🏆' };

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
        <span className="text-2xl" aria-hidden>
          {meta.icon}
        </span>
        {avatar && (
          <img
            src={avatar}
            alt=""
            className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20"
          />
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-bold tracking-tight text-white">{meta.label}</h2>
          <p className="truncate text-xs text-white/50">
            {displayName ?? externalId} · {subtitle}
          </p>
        </div>
      </div>
      {body}
    </section>
  );
}
