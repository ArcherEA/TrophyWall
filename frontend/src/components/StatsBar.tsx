import type { Game } from '../api/types';
import { computeStats } from '../lib/stats';

export function StatsBar({ games }: { games: Game[] }) {
  const { gameCount, hours, unlocked, totalAchievements, overall, perfect } = computeStats(games);

  const tiles = [
    { label: 'Games', value: gameCount.toLocaleString() },
    { label: 'Hours played', value: hours.toLocaleString() },
    {
      label: 'Achievements',
      value: `${unlocked.toLocaleString()} / ${totalAchievements.toLocaleString()}`,
    },
    { label: 'Overall', value: `${overall}%` },
    { label: 'Perfect games', value: perfect.toLocaleString(), gold: perfect > 0 },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-md border border-white/15 bg-black p-4">
          <div className={`text-2xl font-bold ${t.gold ? 'text-amber-400' : 'text-white'}`}>
            {t.value}
          </div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
