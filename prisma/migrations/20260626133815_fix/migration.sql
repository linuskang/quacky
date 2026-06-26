/*
  Warnings:

  - You are about to drop the `repost` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "repost" DROP CONSTRAINT "repost_postId_fkey";

-- DropForeignKey
ALTER TABLE "repost" DROP CONSTRAINT "repost_userId_fkey";

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "repostOfId" TEXT,
ALTER COLUMN "content" SET DEFAULT '';

-- DropTable
DROP TABLE "repost";

-- CreateIndex
CREATE INDEX "post_authorId_idx" ON "post"("authorId");

-- CreateIndex
CREATE INDEX "post_repostOfId_idx" ON "post"("repostOfId");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_repostOfId_fkey" FOREIGN KEY ("repostOfId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
