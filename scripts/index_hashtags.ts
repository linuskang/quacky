import { linkHashtagsToPost } from "../src/lib/hashtags";
import prisma from "../src/server/db";

async function main() {
    console.log("Starting retroactive hashtag indexing...");

    // Get all posts that are not deleted and not hidden
    const posts = await prisma.post.findMany({
        where: {
            isDeleted: false,
            isHidden: false,
            content: {
                contains: "#",
            },
        },
        select: {
            id: true,
            content: true,
        },
    });

    console.log(`Found ${posts.length} posts containing '#' to process.`);

    let indexed = 0;
    for (const post of posts) {
        if (!post.content) continue;
        await linkHashtagsToPost(prisma, post.id, post.content);
        indexed++;
        if (indexed % 100 === 0) {
            console.log(`Processed ${indexed} posts...`);
        }
    }

    console.log(`Finished indexing hashtags for ${indexed} posts.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
