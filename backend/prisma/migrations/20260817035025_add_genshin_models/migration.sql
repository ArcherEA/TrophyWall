-- CreateTable
CREATE TABLE "GenshinCharacter" (
    "id" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "avatarId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "element" TEXT,
    "rarity" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "constellation" INTEGER NOT NULL,
    "friendship" INTEGER,
    "iconUrl" TEXT,
    "talentNormal" INTEGER,
    "talentSkill" INTEGER,
    "talentBurst" INTEGER,
    "weaponName" TEXT,
    "weaponIconUrl" TEXT,
    "weaponLevel" INTEGER,
    "weaponRefinement" INTEGER,
    "weaponRarity" INTEGER,
    "stats" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenshinCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenshinArtifact" (
    "id" TEXT NOT NULL,
    "genshinCharacterId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "mainStat" JSONB NOT NULL,
    "subStats" JSONB NOT NULL,

    CONSTRAINT "GenshinArtifact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GenshinCharacter_linkedAccountId_avatarId_key" ON "GenshinCharacter"("linkedAccountId", "avatarId");

-- AddForeignKey
ALTER TABLE "GenshinCharacter" ADD CONSTRAINT "GenshinCharacter_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenshinArtifact" ADD CONSTRAINT "GenshinArtifact_genshinCharacterId_fkey" FOREIGN KEY ("genshinCharacterId") REFERENCES "GenshinCharacter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
