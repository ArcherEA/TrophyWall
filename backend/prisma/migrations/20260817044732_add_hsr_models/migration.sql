-- CreateTable
CREATE TABLE "HSRCharacter" (
    "id" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "avatarId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "path" TEXT,
    "element" TEXT,
    "rarity" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "eidolon" INTEGER NOT NULL DEFAULT 0,
    "iconUrl" TEXT,
    "lightConeName" TEXT,
    "lightConeIconUrl" TEXT,
    "lightConeLevel" INTEGER,
    "lightConeSuperimpose" INTEGER,
    "lightConeRarity" INTEGER,
    "stats" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "HSRCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HSRRelic" (
    "id" TEXT NOT NULL,
    "hsrCharacterId" TEXT NOT NULL,
    "slot" TEXT NOT NULL,
    "setName" TEXT NOT NULL,
    "rarity" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "mainStat" JSONB NOT NULL,
    "subStats" JSONB NOT NULL,

    CONSTRAINT "HSRRelic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HSRCharacter_linkedAccountId_avatarId_key" ON "HSRCharacter"("linkedAccountId", "avatarId");

-- AddForeignKey
ALTER TABLE "HSRCharacter" ADD CONSTRAINT "HSRCharacter_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HSRRelic" ADD CONSTRAINT "HSRRelic_hsrCharacterId_fkey" FOREIGN KEY ("hsrCharacterId") REFERENCES "HSRCharacter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
