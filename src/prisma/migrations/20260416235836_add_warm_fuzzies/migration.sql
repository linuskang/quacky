-- CreateTable
CREATE TABLE "WarmFuzzy" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WarmFuzzy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WarmFuzzy_recipientId_idx" ON "WarmFuzzy"("recipientId");

-- CreateIndex
CREATE INDEX "WarmFuzzy_senderId_idx" ON "WarmFuzzy"("senderId");

-- CreateIndex
CREATE INDEX "WarmFuzzy_createdAt_idx" ON "WarmFuzzy"("createdAt");

-- AddForeignKey
ALTER TABLE "WarmFuzzy" ADD CONSTRAINT "WarmFuzzy_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WarmFuzzy" ADD CONSTRAINT "WarmFuzzy_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
