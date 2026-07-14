-- CreateEnum
CREATE TYPE "MemeVoteType" AS ENUM ('UPVOTE', 'DOWNVOTE');

-- CreateTable
CREATE TABLE "MemeVote" (
    "id" TEXT NOT NULL,
    "memeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MemeVoteType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MemeVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MemeVote_userId_idx" ON "MemeVote"("userId");

-- CreateIndex
CREATE INDEX "MemeVote_memeId_type_idx" ON "MemeVote"("memeId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "MemeVote_memeId_userId_key" ON "MemeVote"("memeId", "userId");

-- CreateIndex
CREATE INDEX "Memeland_authorId_idx" ON "Memeland"("authorId");

-- CreateIndex
CREATE INDEX "Memeland_createdAt_idx" ON "Memeland"("createdAt");

-- AddForeignKey
ALTER TABLE "MemeVote" ADD CONSTRAINT "MemeVote_memeId_fkey" FOREIGN KEY ("memeId") REFERENCES "Memeland"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemeVote" ADD CONSTRAINT "MemeVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
