CREATE TABLE "post_hashtag" (
    "postId" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_hashtag_pkey" PRIMARY KEY ("postId", "tag")
);

CREATE INDEX "post_hashtag_tag_createdAt_idx" ON "post_hashtag"("tag", "createdAt");

ALTER TABLE "post_hashtag" ADD CONSTRAINT "post_hashtag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "post_hashtag" ("postId", "tag", "createdAt")
SELECT "post"."id", LOWER(matches."match"[2]), "post"."createdAt"
FROM "post"
CROSS JOIN LATERAL REGEXP_MATCHES("post"."content", '(^|[^[:alnum:]_])#([[:alnum:]_]{1,50})', 'g') AS matches("match")
ON CONFLICT DO NOTHING;
