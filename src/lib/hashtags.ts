import type { PrismaClient } from "@prisma/client";

/** Extract unique lowercase hashtag strings from post content (without the #). */
export function parseHashtags(content: string): string[] {
    const matches = content.match(/#([\w]+)/g) ?? [];
    return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}

/**
 * Upsert hashtag records and link them to a post.
 * Safe to call with empty content — does nothing if no tags found.
 */
export async function linkHashtagsToPost(
    prisma: PrismaClient,
    postId: string,
    content: string
): Promise<void> {
    const tags = parseHashtags(content);
    if (tags.length === 0) return;

    for (const tag of tags) {
        const hashtag = await prisma.hashtag.upsert({
            where: { tag },
            create: { tag },
            update: {},
            select: { id: true },
        });
        await prisma.postHashtag.upsert({
            where: { postId_hashtagId: { postId, hashtagId: hashtag.id } },
            create: { postId, hashtagId: hashtag.id },
            update: {},
        });
    }
}

/** Replace all hashtag links for a post with the tags currently present in content. */
export async function syncHashtagsForPost(
    prisma: PrismaClient,
    postId: string,
    content: string
): Promise<void> {
    await prisma.postHashtag.deleteMany({ where: { postId } });
    await linkHashtagsToPost(prisma, postId, content);
}
