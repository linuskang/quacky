/*
  Warnings:

  - You are about to drop the column `issuer` on the `account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[providerId,accountId]` on the table `account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX IF EXISTS "account_issuer_accountId_uidx";

-- AlterTable
ALTER TABLE "account" DROP COLUMN IF EXISTS "issuer";

-- Remove duplicate (providerId, accountId) rows, keeping the latest one
DELETE FROM "account" a
USING "account" b
WHERE a."providerId" = b."providerId"
  AND a."accountId" = b."accountId"
  AND (
    a."updatedAt" < b."updatedAt"
    OR (a."updatedAt" = b."updatedAt" AND a."id" < b."id")
  );

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "account_providerId_accountId_uidx" ON "account"("providerId", "accountId");
