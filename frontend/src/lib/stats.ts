import type { Game } from '../api/types';

export interface LibraryStats {
  gameCount: number;
  hours: number;
  unlocked: number;
  totalAchievements: number;
  overall: number; // percent, 0 when there are no achievements
  perfect: number; // games at 100%
}

export function computeStats(games: Game[]): LibraryStats {
  const unlocked = games.reduce((s, g) => s + g.achievements.unlocked, 0);
  const totalAchievements = games.reduce((s, g) => s + g.achievements.total, 0);
  const perfect = games.filter(
    (g) => g.achievements.total > 0 && g.achievements.percent === 100,
  ).length;
  const hours = Math.round(games.reduce((s, g) => s + g.playtimeForever, 0) / 60);
  const overall = totalAchievements ? Math.round((unlocked / totalAchievements) * 100) : 0;

  return { gameCount: games.length, hours, unlocked, totalAchievements, overall, perfect };
}
