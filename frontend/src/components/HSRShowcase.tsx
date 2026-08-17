import { useState } from 'react';
import type { HSRCharacter } from '../api/types';
import { HSRCharacterCard } from './HSRCharacterCard';
import { HSRCharacterModal } from './HSRCharacterModal';

export function HSRShowcase({ characters }: { characters: HSRCharacter[] }) {
  const [selected, setSelected] = useState<HSRCharacter | null>(null);

  if (characters.length === 0) {
    return <p className="text-white/50">No characters yet — sync your HSR account.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {characters.map((c) => (
          <HSRCharacterCard key={c.id} character={c} onClick={() => setSelected(c)} />
        ))}
      </div>
      {selected && <HSRCharacterModal character={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
