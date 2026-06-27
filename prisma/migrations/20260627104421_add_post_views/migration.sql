-- CreateTable
CREATE TABLE "post_view" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_view_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateIndex
CREATE INDEX "post_view_postId_idx" ON "post_view"("postId");

-- AddForeignKey
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_view" ADD CONSTRAINT "post_view_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
