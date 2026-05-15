/*
  Warnings:

  - You are about to drop the column `accentColor` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "accentColor",
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;
