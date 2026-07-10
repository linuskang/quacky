-- CreateTable
CREATE TABLE "RngEntry" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RngEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RngEntry_userId_date_key" ON "RngEntry"("userId", "date");

-- AddForeignKey
ALTER TABLE "RngEntry" ADD CONSTRAINT "RngEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
