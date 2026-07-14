-- CreateTable
CREATE TABLE "Memeland" (
    "id" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "imgUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Memeland_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Memeland" ADD CONSTRAINT "Memeland_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
