import "dotenv/config";

function required(name: string) : string {
    const value = process.env[name];
    if (!value) throw new Error(`Missing required env variable: ${name}`);
    return value;
}

export const config = {
    port: Number(process.env.PORT ?? 3001),
    steamApiKey: required('STEAM_API_KEY'),
    databaseUrl: required('DATABASE_URL'),
    redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
};

