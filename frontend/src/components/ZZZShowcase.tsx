import { useState } from 'react';
import type { ZZZAgent } from '../api/types';
import { ZZZAgentCard } from './ZZZAgentCard';
import { ZZZAgentModal } from './ZZZAgentModal';

export function ZZZShowcase({ characters }: { characters: ZZZAgent[] }) {
  const [selected, setSelected] = useState<ZZZAgent | null>(null);

  if (characters.length === 0) {
    return <p className="text-white/50">No agents yet — sync your ZZZ account.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
        {characters.map((a) => (
          <ZZZAgentCard key={a.id} agent={a} onClick={() => setSelected(a)} />
        ))}
      </div>
      {selected && <ZZZAgentModal agent={selected} onClose={() => setSelected(null)} />}
    </>
  );
}
