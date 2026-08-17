-- CreateTable
CREATE TABLE "ZZZAgent" (
    "id" TEXT NOT NULL,
    "linkedAccountId" TEXT NOT NULL,
    "avatarId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "element" TEXT,
    "profession" TEXT,
    "rarity" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "mindscape" INTEGER NOT NULL DEFAULT 0,
    "accentColor" TEXT,
    "iconUrl" TEXT,
    "wEngineName" TEXT,
    "wEngineIconUrl" TEXT,
    "wEngineLevel" INTEGER,
    "wEnginePhase" INTEGER,
    "wEngineRarity" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ZZZAgent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZZZDriveDisc" (
    "id" TEXT NOT NULL,
    "zzzAgentId" TEXT NOT NULL,
    "slot" INTEGER NOT NULL,
    "setName" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "iconUrl" TEXT,
    "mainStat" JSONB NOT NULL,
    "subStats" JSONB NOT NULL,

    CONSTRAINT "ZZZDriveDisc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZZZAgent_linkedAccountId_avatarId_key" ON "ZZZAgent"("linkedAccountId", "avatarId");

-- AddForeignKey
ALTER TABLE "ZZZAgent" ADD CONSTRAINT "ZZZAgent_linkedAccountId_fkey" FOREIGN KEY ("linkedAccountId") REFERENCES "LinkedAccounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZZZDriveDisc" ADD CONSTRAINT "ZZZDriveDisc_zzzAgentId_fkey" FOREIGN KEY ("zzzAgentId") REFERENCES "ZZZAgent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
