import { prisma } from '../src/lib/prisma.js';

// Marks every game's catalog as stale so the next sync re-fetches
// schema + assets + global achievement percentages.
async function main() {
  const r = await prisma.steamGameCatalog.updateMany({
    data: { lastFetched: new Date('2000-01-01') },
  });
  console.log('catalog marked stale:', r.count, 'games');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => process.exit(0));
