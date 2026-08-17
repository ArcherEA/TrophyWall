import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env variable: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 3001),
  steamApiKey: required('STEAM_API_KEY'),
  databaseUrl: required('DATABASE_URL'),
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  steamApiUrl: required('STEAM_API_BASE_URL'),
  // comma-separated allowed origins for CORS; unset ⇒ allow all (fine for local dev)
  corsOrigin: process.env.CORS_ORIGIN,
  // CDN base for Genshin icons (homdgcat is region-blocked; enka.network serves all types)
  genshinImageBase: process.env.GENSHIN_IMAGE_BASE ?? 'https://enka.network/ui',
};
