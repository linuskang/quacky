-- CreateTable
CREATE TABLE "Fuzzy" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Fuzzy_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Fuzzy" ADD CONSTRAINT "Fuzzy_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fuzzy" ADD CONSTRAINT "Fuzzy_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
