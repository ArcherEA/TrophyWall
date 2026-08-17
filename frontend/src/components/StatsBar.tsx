import type { Game } from '../api/types';

export function StatsBar({ games }: { games: Game[] }) {
  const withAch = games.filter((g) => g.achievements.total > 0);
  const unlocked = games.reduce((s, g) => s + g.achievements.unlocked, 0);
  const totalAch = games.reduce((s, g) => s + g.achievements.total, 0);
  const perfect = withAch.filter((g) => g.achievements.percent === 100).length;
  const hours = Math.round(games.reduce((s, g) => s + g.playtimeForever, 0) / 60);
  const overall = totalAch ? Math.round((unlocked / totalAch) * 100) : 0;

  const tiles = [
    { label: 'Games', value: games.length.toLocaleString() },
    { label: 'Hours played', value: hours.toLocaleString() },
    { label: 'Achievements', value: `${unlocked.toLocaleString()} / ${totalAch.toLocaleString()}` },
    { label: 'Overall', value: `${overall}%` },
    { label: 'Perfect games', value: perfect.toLocaleString(), gold: perfect > 0 },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
      {tiles.map((t) => (
        <div key={t.label} className="rounded-md border border-white/15 bg-black p-4">
          <div className={`text-2xl font-bold ${t.gold ? 'text-amber-400' : 'text-white'}`}>{t.value}</div>
          <div className="mt-1 text-[11px] uppercase tracking-widest text-white/50">{t.label}</div>
        </div>
      ))}
    </div>
  );
}
