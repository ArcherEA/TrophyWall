import { prisma } from '../lib/prisma.js';
import { accountService } from './account.service.js';

async function getSteamProfile() {
    const account = await accountService.getSteamAccountForCurrentUser();
    if (!account) return null;

    const [games, achievements] = await Promise.all([
        prisma.steamGame.findMany({
            where: {linkedAccountId: account.id },
            include: {catalogEntry: true},
            orderBy: { playtimeForever: 'desc'},
        }),
        prisma.steamAchievement.findMany({
            where: { linkedAccountId: account.id },
            include: { achievementCatalog: true },
        }),
    ]);

    const byApp = new Map<number, typeof achievements>();
    for (const a of achievements) {
        const appId = a.achievementCatalog.appId;
        const list = byApp.get(appId) ?? [];
        list.push(a);
        byApp.set(appId, list);
    }

    const gameList = games.map((g) => {
        const ach = byApp.get(g.appId) ?? [];
        const unlocked = ach.filter((a)=> a.unlocked).length;
        return {
            appId: g.appId,
            name: g.catalogEntry.name,
            playtimeForever: g.playtimeForever,
            playtime2Weeks: g.playtime2Weeks,
            images: {
                icon: g.catalogEntry.iconUrl,
                header: g.catalogEntry.headerUrl,
                capsule: g.catalogEntry.capsuleUrl,
                libraryCover: g.catalogEntry.libraryCoverUrl,
            },
            achievements: {
                total: ach.length,
                unlocked,
                percent: ach.length ? Math.round((unlocked / ach.length) * 100) : null,
                items: ach.map((a) => ({
                apiName: a.achievementCatalog.apiName,
                displayName: a.achievementCatalog.displayName,
                description: a.achievementCatalog.description,
                icon: a.unlocked ? a.achievementCatalog.iconUrl : a.achievementCatalog.iconGrayUrl,
                hidden: a.achievementCatalog.hidden,
                globalPercent: a.achievementCatalog.globalPercent,
                unlocked: a.unlocked,
                unlockedAt: a.unlockedAt,
                })),
            }
        }
    });

    return {
        account: {
            steamId: account.externalId,
            displayName: account.displayName,
            lastSyncedAt: account.lastSyncedAt,
        },
        games: gameList,
    }
}

export const profileService = { getSteamProfile };