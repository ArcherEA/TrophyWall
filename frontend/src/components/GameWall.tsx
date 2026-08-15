import { useState } from 'react';
import type { Game } from '../api/types';
import { GameCard } from './GameCard';
import { AchievementModal } from './AchievementModal';

export function GameWall({ games }: { games: Game[] }) {
  const [selected, setSelected] = useState<Game | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {games.map((g) => (
          <GameCard key={g.appId} game={g} onClick={() => setSelected(g)} />
        ))}
      </div>
      {selected && <AchievementModal game={selected} onClose={() => setSelected(null)} />}
    </>
  );
}