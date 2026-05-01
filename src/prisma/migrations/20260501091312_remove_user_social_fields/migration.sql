/*
  Warnings:

  - You are about to drop the column `discord` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `github` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twitter` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "discord",
DROP COLUMN "github",
DROP COLUMN "twitter";
