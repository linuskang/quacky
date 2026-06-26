-- CreateTable
CREATE TABLE "post_attachment" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_attachment_postId_idx" ON "post_attachment"("postId");

-- AddForeignKey
ALTER TABLE "post_attachment" ADD CONSTRAINT "post_attachment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
