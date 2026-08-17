import { useEffect, useState } from 'react';
import type { Snapshot } from './api/types';
import { PlatformSection } from './components/PlatformSection';

// The public site is read-only: it reads the static snapshot produced by the
// backend's `export:static` script (served from public/data/profile.json).
export default function App() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/profile.json`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((s: Snapshot) => setSnapshot(s))
      .catch((e) => setError((e as Error).message));
  }, []);

  const updated = snapshot ? new Date(snapshot.generatedAt).toLocaleDateString() : null;

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/15 bg-black">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <h1 className="text-3xl font-bold tracking-tight">🏆 Trophy Wall</h1>
          <p className="mt-1 text-sm text-white/50">
            {snapshot
              ? `${snapshot.profiles.length} accounts${updated ? ` · updated ${updated}` : ''}`
              : error
                ? ''
                : 'Loading…'}
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        {error ? (
          <p className="text-white/50">
            Couldn’t load the showcase data ({error}). If you’re running locally, generate it with{' '}
            <code className="rounded bg-white/10 px-1">npm run export:static</code> in the backend.
          </p>
        ) : (
          snapshot?.profiles.map((p, i) => (
            <PlatformSection
              key={`${p.account.platform}-${p.account.externalId}-${i}`}
              profile={p}
            />
          ))
        )}
      </main>
    </div>
  );
}
