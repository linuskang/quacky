BEGIN;

-- Seed testing users.
INSERT INTO "user" (
    "id",
    "name",
    "username",
    "email",
    "emailVerified",
    "image",
    "verified",
    "statsForNerds",
    "private",
    "streamerMode",
    "hideTips",
    "createdAt",
    "updatedAt",
    "role",
    "banned"
) VALUES
    ('travis-testing', 'Travis Testing', 'travis-testing', 'travis-testing@example.test', true, 'https://api.dicebear.com/9.x/thumbs/svg?seed=travis-testing', false, false, false, false, false, NOW() - INTERVAL '18 days', NOW(), NULL, false),
    ('audrey-testing', 'Audrey Testing', 'audrey-testing', 'audrey-testing@example.test', true, 'https://api.dicebear.com/9.x/thumbs/svg?seed=audrey-testing', true, false, false, false, false, NOW() - INTERVAL '17 days', NOW(), NULL, false),
    ('andrew-testing', 'Andrew Testing', 'andrew-testing', 'andrew-testing@example.test', true, 'https://api.dicebear.com/9.x/thumbs/svg?seed=andrew-testing', false, false, false, false, false, NOW() - INTERVAL '16 days', NOW(), NULL, false),
    ('sally-testing', 'Sally Testing', 'sally-testing', 'sally-testing@example.test', true, 'https://api.dicebear.com/9.x/thumbs/svg?seed=sally-testing', false, false, false, false, false, NOW() - INTERVAL '15 days', NOW(), NULL, false),
    ('maddy-testing', 'Maddy Testing', 'maddy-testing', 'maddy-testing@example.test', true, 'https://api.dicebear.com/9.x/thumbs/svg?seed=maddy-testing', true, false, false, false, false, NOW() - INTERVAL '14 days', NOW(), NULL, false),
    ('bob-testing', 'Bob Testing', 'bob-testing', 'bob-testing@example.test', true, 'https://api.dicebear.com/9.x/thumbs/svg?seed=bob-testing', false, false, false, false, false, NOW() - INTERVAL '13 days', NOW(), NULL, false)
ON CONFLICT ("id") DO UPDATE SET
    "name" = EXCLUDED."name",
    "username" = EXCLUDED."username",
    "email" = EXCLUDED."email",
    "image" = EXCLUDED."image",
    "verified" = EXCLUDED."verified",
    "banned" = false,
    "updatedAt" = NOW();

-- Make the test accounts follow each other.
WITH seed_users("id") AS (
    VALUES
        ('travis-testing'),
        ('audrey-testing'),
        ('andrew-testing'),
        ('sally-testing'),
        ('maddy-testing'),
        ('bob-testing')
)
INSERT INTO "follow" ("userId", "followId", "createdAt")
SELECT follower."id", followed."id", NOW() - (ABS(HASHTEXT(follower."id" || followed."id")) % 12) * INTERVAL '1 day'
FROM seed_users follower
CROSS JOIN seed_users followed
WHERE follower."id" <> followed."id"
ON CONFLICT ("userId", "followId") DO NOTHING;

-- Base posts plus quote/repost posts. Empty content + repostOfId is a normal repost.
INSERT INTO "post" (
    "id",
    "authorId",
    "content",
    "flagged",
    "edited",
    "createdAt",
    "updatedAt",
    "views",
    "repostOfId"
) VALUES
    ('seed-post-001', 'travis-testing', 'launching a tiny test timeline for #quacky. reply with chaos.', false, false, NOW() - INTERVAL '9 days 6 hours', NOW() - INTERVAL '9 days 6 hours', 42, NULL),
    ('seed-post-002', 'audrey-testing', 'the #design pass is finally clicking. cards feel less cramped now.', false, false, NOW() - INTERVAL '9 days 2 hours', NOW() - INTERVAL '9 days 2 hours', 61, NULL),
    ('seed-post-003', 'andrew-testing', 'i broke the feed sorter and somehow made #quacky faster?', false, false, NOW() - INTERVAL '8 days 22 hours', NOW() - INTERVAL '8 days 22 hours', 78, NULL),
    ('seed-post-004', 'sally-testing', 'hot take: every staging db needs a little #drama to prove comments work.', false, false, NOW() - INTERVAL '8 days 16 hours', NOW() - INTERVAL '8 days 16 hours', 34, NULL),
    ('seed-post-005', 'maddy-testing', 'shipping #projects with a playlist and irresponsible confidence.', false, false, NOW() - INTERVAL '8 days 3 hours', NOW() - INTERVAL '8 days 3 hours', 89, NULL),
    ('seed-post-006', 'bob-testing', 'can confirm the duck is load bearing. #quacky #infra', false, false, NOW() - INTERVAL '7 days 21 hours', NOW() - INTERVAL '7 days 21 hours', 103, NULL),
    ('seed-post-007', 'travis-testing', 'does anyone else test notifications by starting fake arguments? #dev', false, false, NOW() - INTERVAL '7 days 4 hours', NOW() - INTERVAL '7 days 4 hours', 57, NULL),
    ('seed-post-008', 'audrey-testing', 'button radius discourse has entered the chat. #design #drama', false, false, NOW() - INTERVAL '6 days 23 hours', NOW() - INTERVAL '6 days 23 hours', 112, NULL),
    ('seed-post-009', 'andrew-testing', 'i added logs and the bug got scared. #dev', false, false, NOW() - INTERVAL '6 days 10 hours', NOW() - INTERVAL '6 days 10 hours', 93, NULL),
    ('seed-post-010', 'sally-testing', 'morning standup summary: vibes uncertain, tests green. #team', false, false, NOW() - INTERVAL '6 days 1 hour', NOW() - INTERVAL '6 days 1 hour', 48, NULL),
    ('seed-post-011', 'maddy-testing', 'the staging seed needs more tiny conversations. #quacky #testing', false, false, NOW() - INTERVAL '5 days 20 hours', NOW() - INTERVAL '5 days 20 hours', 73, NULL),
    ('seed-post-012', 'bob-testing', 'postgres indexes are just cheat codes with invoices. #infra', false, false, NOW() - INTERVAL '5 days 9 hours', NOW() - INTERVAL '5 days 9 hours', 65, NULL),
    ('seed-post-013', 'travis-testing', 'new composer idea: preview hashtags before posting. #quacky #ideas', false, false, NOW() - INTERVAL '4 days 23 hours', NOW() - INTERVAL '4 days 23 hours', 121, NULL),
    ('seed-post-014', 'audrey-testing', 'the empty state should be friendly but not begging for attention. #design', false, false, NOW() - INTERVAL '4 days 13 hours', NOW() - INTERVAL '4 days 13 hours', 52, NULL),
    ('seed-post-015', 'andrew-testing', 'i trust migrations exactly until i have to run them live. #infra #dev', false, false, NOW() - INTERVAL '4 days 2 hours', NOW() - INTERVAL '4 days 2 hours', 99, NULL),
    ('seed-post-016', 'sally-testing', 'reply chains should feel like a hallway conversation. #product', false, false, NOW() - INTERVAL '3 days 18 hours', NOW() - INTERVAL '3 days 18 hours', 87, NULL),
    ('seed-post-017', 'maddy-testing', 'bookmarking every weird post for science. #testing', false, false, NOW() - INTERVAL '3 days 5 hours', NOW() - INTERVAL '3 days 5 hours', 44, NULL),
    ('seed-post-018', 'bob-testing', 'if it works locally, add three more users and try again. #testing #dev', false, false, NOW() - INTERVAL '2 days 22 hours', NOW() - INTERVAL '2 days 22 hours', 110, NULL),
    ('seed-post-019', 'travis-testing', 'today in fake social network news: everyone likes ducks. #quacky', false, false, NOW() - INTERVAL '2 days 8 hours', NOW() - INTERVAL '2 days 8 hours', 138, NULL),
    ('seed-post-020', 'audrey-testing', 'proposal: trending should not be empty on demo day. #product #quacky', false, false, NOW() - INTERVAL '1 day 21 hours', NOW() - INTERVAL '1 day 21 hours', 166, NULL),
    ('seed-post-021', 'andrew-testing', 'seed scripts are underrated. deterministic fake chaos is still chaos. #testing', false, false, NOW() - INTERVAL '1 day 15 hours', NOW() - INTERVAL '1 day 15 hours', 72, NULL),
    ('seed-post-022', 'sally-testing', 'someone explain why the best bug reports start with "so i clicked around". #product', false, false, NOW() - INTERVAL '1 day 7 hours', NOW() - INTERVAL '1 day 7 hours', 118, NULL),
    ('seed-post-023', 'maddy-testing', 'tiny polish task turned into a whole personality. #design #projects', false, false, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '18 hours', 95, NULL),
    ('seed-post-024', 'bob-testing', 'backups are boring until they are the main character. #infra', false, false, NOW() - INTERVAL '10 hours', NOW() - INTERVAL '10 hours', 83, NULL),
    ('seed-post-025', 'audrey-testing', 'quote posting this because it accidentally describes our roadmap. #product', false, false, NOW() - INTERVAL '7 hours', NOW() - INTERVAL '7 hours', 29, 'seed-post-013'),
    ('seed-post-026', 'andrew-testing', '', false, false, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '6 hours', 14, 'seed-post-020'),
    ('seed-post-027', 'sally-testing', 'the replies here are exactly the sort of #drama we needed for testing.', false, false, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours', 36, 'seed-post-008'),
    ('seed-post-028', 'maddy-testing', '', false, false, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '4 hours', 18, 'seed-post-019'),
    ('seed-post-029', 'bob-testing', 'quoting for posterity before someone "cleans up" the seed data. #testing', false, false, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours', 41, 'seed-post-021'),
    ('seed-post-030', 'travis-testing', '', false, false, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours', 20, 'seed-post-024')
ON CONFLICT ("id") DO UPDATE SET
    "authorId" = EXCLUDED."authorId",
    "content" = EXCLUDED."content",
    "flagged" = false,
    "edited" = EXCLUDED."edited",
    "updatedAt" = EXCLUDED."updatedAt",
    "views" = EXCLUDED."views",
    "repostOfId" = EXCLUDED."repostOfId";

-- Hashtags for seeded posts. Comments intentionally do not feed trending.
INSERT INTO "post_hashtag" ("postId", "tag", "createdAt")
SELECT "post"."id", LOWER(matches."match"[2]), "post"."createdAt"
FROM "post"
CROSS JOIN LATERAL REGEXP_MATCHES("post"."content", '(^|[^[:alnum:]_])#([[:alnum:]_]{1,50})', 'g') AS matches("match")
WHERE "post"."id" LIKE 'seed-post-%'
ON CONFLICT ("postId", "tag") DO NOTHING;

-- A lot of likes, distributed pseudo-randomly across the seed posts.
WITH seed_users("id") AS (
    VALUES
        ('travis-testing'),
        ('audrey-testing'),
        ('andrew-testing'),
        ('sally-testing'),
        ('maddy-testing'),
        ('bob-testing')
), seed_posts AS (
    SELECT "id", "authorId"
    FROM "post"
    WHERE "id" LIKE 'seed-post-%'
)
INSERT INTO "like" ("userId", "postId", "createdAt")
SELECT seed_users."id", seed_posts."id", NOW() - (ABS(HASHTEXT(seed_users."id" || seed_posts."id")) % 240) * INTERVAL '1 hour'
FROM seed_users
CROSS JOIN seed_posts
WHERE seed_users."id" <> seed_posts."authorId"
AND ABS(HASHTEXT(seed_users."id" || seed_posts."id" || 'like')) % 100 < 78
ON CONFLICT ("userId", "postId") DO NOTHING;

-- Bookmarks for a smaller saved-post signal.
WITH seed_users("id") AS (
    VALUES
        ('travis-testing'),
        ('audrey-testing'),
        ('andrew-testing'),
        ('sally-testing'),
        ('maddy-testing'),
        ('bob-testing')
), seed_posts AS (
    SELECT "id"
    FROM "post"
    WHERE "id" LIKE 'seed-post-%'
)
INSERT INTO "bookmark" ("userId", "postId", "createdAt")
SELECT seed_users."id", seed_posts."id", NOW() - (ABS(HASHTEXT(seed_users."id" || seed_posts."id" || 'bookmark')) % 144) * INTERVAL '1 hour'
FROM seed_users
CROSS JOIN seed_posts
WHERE ABS(HASHTEXT(seed_users."id" || seed_posts."id" || 'bookmark')) % 100 < 22
ON CONFLICT ("userId", "postId") DO NOTHING;

-- Post views, so view counts have realistic viewer records too.
WITH seed_users("id") AS (
    VALUES
        ('travis-testing'),
        ('audrey-testing'),
        ('andrew-testing'),
        ('sally-testing'),
        ('maddy-testing'),
        ('bob-testing')
), seed_posts AS (
    SELECT "id"
    FROM "post"
    WHERE "id" LIKE 'seed-post-%'
)
INSERT INTO "post_view" ("userId", "postId", "createdAt")
SELECT seed_users."id", seed_posts."id", NOW() - (ABS(HASHTEXT(seed_users."id" || seed_posts."id" || 'view')) % 240) * INTERVAL '1 hour'
FROM seed_users
CROSS JOIN seed_posts
WHERE ABS(HASHTEXT(seed_users."id" || seed_posts."id" || 'view')) % 100 < 86
ON CONFLICT ("userId", "postId") DO NOTHING;

-- Comments: dense enough to make threads feel active.
WITH seed_users("id") AS (
    VALUES
        ('travis-testing'),
        ('audrey-testing'),
        ('andrew-testing'),
        ('sally-testing'),
        ('maddy-testing'),
        ('bob-testing')
), comment_templates("idx", "content") AS (
    VALUES
        (1, 'this is exactly the kind of fake-but-useful conversation i wanted'),
        (2, 'replying so the thread has some shape'),
        (3, 'the weird part is that this sounds real'),
        (4, 'bookmarking this for later testing'),
        (5, 'i disagree but only for staging purposes'),
        (6, 'strong demo-data energy here'),
        (7, 'can someone try this on mobile too?'),
        (8, 'this thread needs one more tiny opinion'),
        (9, 'adding a comment with #commenttag that should not trend'),
        (10, 'the duck would approve'),
        (11, 'i clicked around and nothing exploded'),
        (12, 'this is now canon')
), seed_posts AS (
    SELECT "id", "authorId", ROW_NUMBER() OVER (ORDER BY "createdAt") AS post_no
    FROM "post"
    WHERE "id" BETWEEN 'seed-post-001' AND 'seed-post-024'
), raw_comments AS (
    SELECT
        seed_posts."id" AS "postId",
        seed_users."id" AS "authorId",
        comment_templates."content",
        NOW() - ((seed_posts.post_no * 7 + comment_templates."idx") % 220) * INTERVAL '1 hour' AS "createdAt"
    FROM seed_posts
    JOIN comment_templates ON comment_templates."idx" <= 6
    JOIN seed_users ON seed_users."id" <> seed_posts."authorId"
    WHERE ABS(HASHTEXT(seed_posts."id" || seed_users."id" || comment_templates."idx")) % 100 < 38
), generated_comments AS (
    SELECT
        'seed-comment-' || LPAD(ROW_NUMBER() OVER (ORDER BY "postId", "authorId", "content")::TEXT, 3, '0') AS "id",
        "postId",
        "authorId",
        "content",
        "createdAt"
    FROM raw_comments
)
INSERT INTO "comment" ("id", "postId", "authorId", "content", "flagged", "createdAt", "updatedAt")
SELECT "id", "postId", "authorId", "content", false, "createdAt", "createdAt"
FROM generated_comments
ON CONFLICT ("id") DO UPDATE SET
    "postId" = EXCLUDED."postId",
    "authorId" = EXCLUDED."authorId",
    "content" = EXCLUDED."content",
    "flagged" = false,
    "updatedAt" = EXCLUDED."updatedAt";

COMMIT;
