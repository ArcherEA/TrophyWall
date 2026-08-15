import { useMemo, useState } from 'react';
import type { Game } from '../api/types';
import { GameCard } from './GameCard';
import { AchievementModal } from './AchievementModal';

type Sort = 'playtime' | 'completion' | 'name';

export function GameWall({ games }: { games: Game[] }) {
  const [selected, setSelected] = useState<Game | null>(null);
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<Sort>('playtime');
  const [onlyAch, setOnlyAch] = useState(false);

  const shown = useMemo(() => {
    let list = games;
    if (q) list = list.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()));
    if (onlyAch) list = list.filter((g) => g.achievements.total > 0);
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'completion') return (b.achievements.percent ?? -1) - (a.achievements.percent ?? -1);
      return b.playtimeForever - a.playtimeForever;
    });
  }, [games, q, sort, onlyAch]);

  return (
    <>
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search games…"
          className="rounded border border-white/20 bg-black px-3 py-1.5 text-sm text-white placeholder-white/40 outline-none focus:border-white/60"
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="rounded border border-white/20 bg-black px-2 py-1.5 text-sm text-white outline-none focus:border-white/60"
        >
          <option value="playtime">Most played</option>
          <option value="completion">Highest completion</option>
          <option value="name">Name (A–Z)</option>
        </select>
        <label className="flex items-center gap-1.5 text-sm text-white/70">
          <input type="checkbox" checked={onlyAch} onChange={(e) => setOnlyAch(e.target.checked)} />
          With achievements
        </label>
        <span className="ml-auto text-sm text-white/50">{shown.length} games</span>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {shown.map((g) => (
          <GameCard key={g.appId} game={g} onClick={() => setSelected(g)} />
        ))}
      </div>

      {selected && <AchievementModal game={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
