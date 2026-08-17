import { fileURLToPath } from 'node:url';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { accountService } from '../src/services/account.service.js';
import { profileService } from '../src/services/profile.service.js';
import { dispatchSync } from '../src/services/sync-dispatch.js';

// Generates the static snapshot the public GitHub Pages site reads.
// Aggregates every linked account (all platforms) into one JSON file.
// Pass --sync to refresh from the game APIs first.
//   npm run export:static            (export current DB state)
//   npm run export:static -- --sync  (sync all accounts, then export)

const OUT = fileURLToPath(new URL('../../frontend/public/data/profile.json', import.meta.url));

async function main() {
  const shouldSync = process.argv.includes('--sync');

  if (shouldSync) {
    const accounts = await accountService.listAccounts();
    console.log(`syncing ${accounts.length} account(s)…`);
    for (const acc of accounts) {
      try {
        const result = await dispatchSync(acc.id);
        console.log(`  ✓ ${acc.platform} ${acc.externalId}`, result);
      } catch (err) {
        console.error(`  ✗ ${acc.platform} ${acc.externalId}:`, (err as Error).message);
      }
    }
  }

  const profiles = await profileService.getAllProfiles();
  const payload = { generatedAt: new Date().toISOString(), profiles };

  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload), 'utf8');

  const bytes = Buffer.byteLength(JSON.stringify(payload));
  console.log(`wrote ${profiles.length} profile(s) → ${OUT} (${(bytes / 1024).toFixed(1)} KB)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
