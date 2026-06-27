-- Backfill the creator's initial view for existing posts.
INSERT INTO "post_view" ("userId", "postId", "createdAt")
SELECT "authorId", "id", "createdAt"
FROM "post"
ON CONFLICT DO NOTHING;
