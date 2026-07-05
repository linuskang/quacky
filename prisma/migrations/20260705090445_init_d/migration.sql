-- CreateTable
CREATE TABLE "Dm" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Dm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Dm_senderId_receiverId_idx" ON "Dm"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Dm_receiverId_senderId_idx" ON "Dm"("receiverId", "senderId");

-- CreateIndex
CREATE INDEX "Dm_createdAt_idx" ON "Dm"("createdAt");

-- AddForeignKey
ALTER TABLE "Dm" ADD CONSTRAINT "Dm_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Dm" ADD CONSTRAINT "Dm_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
