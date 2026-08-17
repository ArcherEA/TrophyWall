import { useState } from 'react';
import type { GenshinCharacter } from '../api/types';
import { GenshinCharacterCard } from './GenshinCharacterCard';
import { GenshinCharacterModal } from './GenshinCharacterModal';

export function GenshinShowcase({ characters }: { characters: GenshinCharacter[] }) {
  const [selected, setSelected] = useState<GenshinCharacter | null>(null);

  if (characters.length === 0) {
    return <p className="text-white/50">No characters yet — sync your Genshin account.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {characters.map((c) => (
          <GenshinCharacterCard key={c.id} character={c} onClick={() => setSelected(c)} />
        ))}
      </div>
      {selected && <GenshinCharacterModal character={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
