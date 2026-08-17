import { logger } from '../lib/logger.js';

// Enka publishes ZZZ static data as small JSON files. No npm library resolves ZZZ,
// so we fetch these once (with a TTL) and resolve ids → names/icons/stats ourselves.
// GitHub raw is reachable; jsDelivr is a CDN fallback for the same repo.
const REPO_ROOTS = [
  'https://raw.githubusercontent.com/EnkaNetwork/API-docs/master',
  'https://cdn.jsdelivr.net/gh/EnkaNetwork/API-docs@master',
];
const SOURCES = REPO_ROOTS.map((r) => `${r}/store/zzz`);

const UA = 'TrophyWall/1.0 (+trophy-wall)';
const TTL_MS = 6 * 60 * 60 * 1000; // 6h — the store changes only on game updates

export interface AvatarEntry {
  Name: string; // loc key
  Rarity: number; // 4 = S, 3 = A
  ProfessionType?: string;
  ElementTypes?: string[];
  Image?: string; // /ui/zzz/...
  CircleIcon?: string;
  WeaponId?: number;
  Colors?: { Accent?: string; Mindscape?: string };
}

interface WeaponStat {
  PropertyId: number;
  PropertyValue: number;
}

export interface WeaponEntry {
  ItemName: string; // loc key
  Rarity: number;
  ProfessionType?: string;
  ImagePath?: string;
  MainStat?: WeaponStat; // always Base ATK
  SecondaryStat?: WeaponStat; // advanced stat (CRIT Rate, ATK%, PEN%, …)
}

// Per-weapon tooltip carries the signature effect text per phase (P1–P5).
export interface WeaponTooltip {
  ItemName?: string;
  Talents?: Record<string, { Title?: string; Description?: string }>;
}

interface EquipmentStore {
  Items: Record<string, { Rarity: number; SuitId: number }>;
  Suits: Record<string, { Icon?: string; Name: string }>;
}

export interface PropertyEntry {
  Name: string; // e.g. "CritDmg"
  Format: string; // .NET-style, e.g. "{0:0.#%}" — a '%' means the value is a percentage
}

export interface ZZZStore {
  avatars: Record<string, AvatarEntry>;
  weapons: Record<string, WeaponEntry>;
  equipments: EquipmentStore;
  property: Record<string, PropertyEntry>;
  loc: Record<string, string>; // English text map
}

let cache: { store: ZZZStore; at: number } | null = null;
let inflight: Promise<ZZZStore> | null = null;

async function fetchFrom(bases: string[], path: string): Promise<unknown> {
  let lastErr: unknown;
  for (const base of bases) {
    try {
      const res = await fetch(`${base}/${path}`, { headers: { 'User-Agent': UA } });
      if (res.ok) return res.json();
      lastErr = new Error(`${res.status} ${res.statusText}`);
    } catch (err) {
      lastErr = err;
    }
  }
  throw new Error(`failed to fetch ${path}: ${String(lastErr)}`);
}

const fetchJson = (file: string) => fetchFrom(SOURCES, file);

async function load(): Promise<ZZZStore> {
  logger.info('downloading ZZZ static store…');
  const [avatars, weapons, equipments, property, locs] = (await Promise.all([
    fetchJson('avatars.json'),
    fetchJson('weapons.json'),
    fetchJson('equipments.json'),
    fetchJson('property.json'),
    fetchJson('locs.json'),
  ])) as [
    Record<string, AvatarEntry>,
    Record<string, WeaponEntry>,
    EquipmentStore,
    Record<string, PropertyEntry>,
    Record<string, Record<string, string>>,
  ];
  logger.info('ZZZ store ready');
  return { avatars, weapons, equipments, property, loc: locs.en ?? {} };
}

/** Get the ZZZ static store, refreshing at most once per TTL. */
export async function getZZZStore(): Promise<ZZZStore> {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.store;
  if (!inflight) {
    inflight = load()
      .then((store) => {
        cache = { store, at: Date.now() };
        return store;
      })
      .finally(() => {
        inflight = null;
      });
  }
  return inflight;
}

// Weapon tooltips are per-id files; cache each one for the store TTL. Best-effort:
// a missing/failed tooltip just omits the effect text.
const tooltipCache = new Map<number, { tip: WeaponTooltip | null; at: number }>();

export async function getWeaponTooltip(id: number): Promise<WeaponTooltip | null> {
  const hit = tooltipCache.get(id);
  if (hit && Date.now() - hit.at < TTL_MS) return hit.tip;
  let tip: WeaponTooltip | null = null;
  try {
    tip = (await fetchFrom(REPO_ROOTS, `tooltip-data/zzz/EN/Weapons/${id}.json`)) as WeaponTooltip;
  } catch (err) {
    logger.warn({ err, id }, 'zzz weapon tooltip fetch failed');
  }
  tooltipCache.set(id, { tip, at: Date.now() });
  return tip;
}
