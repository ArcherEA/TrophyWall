/*
  Warnings:

  - A unique constraint covering the columns `[userId,platform,externalId]` on the table `LinkedAccounts` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LinkedAccounts_userId_platform_key";

-- AlterTable
ALTER TABLE "LinkedAccounts" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "LinkedAccounts_userId_platform_externalId_key" ON "LinkedAccounts"("userId", "platform", "externalId");
