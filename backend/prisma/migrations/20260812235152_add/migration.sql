-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('STEAM', 'GENSHIN', 'HSR', 'ZZZ');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LinkedAccounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "externalId" TEXT NOT NULL,
    "displayName" TEXT,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LinkedAccounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SteamGameCatalog" (
    "appId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "iconUrl" TEXT,
    "headerUrl" TEXT,
    "capsuleUrl" TEXT,
    "libraryCoverUrl" TEXT,
    "lastFetched" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SteamGameCatalog_pkey" PRIMARY KEY ("appId")
);

-- CreateTable
CREATE TABLE "SteamGame" (
    "id" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "appId" INTEGER NOT NULL,
    "playtimeForever" INTEGER NOT NULL,
    "playtime2Weeks" INTEGER,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SteamGame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SteamAchievementCatalog" (
    "id" TEXT NOT NULL,
    "appId" INTEGER NOT NULL,
    "apiName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "iconUrl" TEXT NOT NULL,
    "iconGrayUrl" TEXT NOT NULL,
    "hidden" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SteamAchievementCatalog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SteamAchievement" (
    "id" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "achievementCatalogId" TEXT NOT NULL,
    "unlocked" BOOLEAN NOT NULL DEFAULT false,
    "unlockedAt" TIMESTAMP(3),

    CONSTRAINT "SteamAchievement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "LinkedAccounts_userId_platform_key" ON "LinkedAccounts"("userId", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "SteamGame_linkedAccountId_appId_key" ON "SteamGame"("linkedAccountId", "appId");

-- CreateIndex
CREATE UNIQUE INDEX "SteamAchievementCatalog_appId_apiName_key" ON "SteamAchievementCatalog"("appId", "apiName");

-- CreateIndex
CREATE UNIQUE INDEX "SteamAchievement_linkedAccountId_achievementCatalogId_key" ON "SteamAchievement"("linkedAccountId", "achievementCatalogId");

-- AddForeignKey
ALTER TABLE "LinkedAccounts" ADD CONSTRAINT "LinkedAccounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteamGame" ADD CONSTRAINT "SteamGame_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteamGame" ADD CONSTRAINT "SteamGame_appId_fkey" FOREIGN KEY ("appId") REFERENCES "SteamGameCatalog"("appId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteamAchievementCatalog" ADD CONSTRAINT "SteamAchievementCatalog_appId_fkey" FOREIGN KEY ("appId") REFERENCES "SteamGameCatalog"("appId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteamAchievement" ADD CONSTRAINT "SteamAchievement_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SteamAchievement" ADD CONSTRAINT "SteamAchievement_achievementCatalogId_fkey" FOREIGN KEY ("achievementCatalogId") REFERENCES "SteamAchievementCatalog"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
