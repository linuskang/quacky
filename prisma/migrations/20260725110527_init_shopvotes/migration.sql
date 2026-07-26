-- CreateEnum
CREATE TYPE "ShopSuggestionVoteType" AS ENUM ('UP', 'DOWN');

-- CreateTable
CREATE TABLE "ShopSuggestion" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ShopSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShopSuggestionVote" (
    "id" TEXT NOT NULL,
    "suggestionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ShopSuggestionVoteType" NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ShopSuggestionVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ShopSuggestion_createdByUserId_idx" ON "ShopSuggestion"("createdByUserId");

-- CreateIndex
CREATE INDEX "ShopSuggestion_pending_idx" ON "ShopSuggestion"("pending");

-- CreateIndex
CREATE INDEX "ShopSuggestionVote_userId_idx" ON "ShopSuggestionVote"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ShopSuggestionVote_suggestionId_userId_key" ON "ShopSuggestionVote"("suggestionId", "userId");

-- AddForeignKey
ALTER TABLE "ShopSuggestion" ADD CONSTRAINT "ShopSuggestion_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopSuggestionVote" ADD CONSTRAINT "ShopSuggestionVote_suggestionId_fkey" FOREIGN KEY ("suggestionId") REFERENCES "ShopSuggestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopSuggestionVote" ADD CONSTRAINT "ShopSuggestionVote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
