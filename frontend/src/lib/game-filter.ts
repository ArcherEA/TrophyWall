import type { Game } from '../api/types';

export type GameSort = 'playtime' | 'completion' | 'name';

export interface GameFilter {
  q: string;
  sort: GameSort;
  onlyAch: boolean;
}

export function sortAndFilter(games: Game[], { q, sort, onlyAch }: GameFilter): Game[] {
  let list = games;
  if (q) list = list.filter((g) => g.name.toLowerCase().includes(q.toLowerCase()));
  if (onlyAch) list = list.filter((g) => g.achievements.total > 0);

  return [...list].sort((a, b) => {
    if (sort === 'name') return a.name.localeCompare(b.name);
    if (sort === 'completion')
      return (b.achievements.percent ?? -1) - (a.achievements.percent ?? -1);
    return b.playtimeForever - a.playtimeForever; // 'playtime'
  });
}
