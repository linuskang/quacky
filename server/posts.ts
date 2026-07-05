import "server-only";

import { prisma } from "@/server/prisma";
import type { Post } from "@/types";

export async function fetchPosts({
    userId,
    hashtag,
}: {
    userId: string;
    hashtag?: string | null;
}) {
    const normalisedHashtag = hashtag?.toLowerCase();

    const posts = await prisma.post.findMany({
        where: {
            flagged: false,
            author: {
                banned: false,
            },
            hashtags: normalisedHashtag
                ? {
                    some: {
                        tag: normalisedHashtag,
                    },
                }
                : undefined,
            OR: [
                {
                    repostOfId: null,
                },
                {
                    repostOf: {
                        flagged: false,
                        author: {
                            banned: false,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,

            author: {
                select: {
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },

            content: true,
            repostOfId: true,

            repostOf: {
                select: {
                    id: true,
                    author: {
                        select: {
                            name: true,
                            username: true,
                            image: true,
                            verified: true,
                            role: true,
                        },
                    },
                    content: true,
                    flagged: true,
                    edited: true,
                    createdAt: true,
                    updatedAt: true,
                    views: true,
                    attachments: {
                        select: {
                            name: true,
                            url: true,
                            type: true,
                        },
                    },
                },
            },

            flagged: true,
            edited: true,
            createdAt: true,
            updatedAt: true,
            views: true,

            _count: {
                select: {
                    likes: true,
                    reposts: true,
                    comments: {
                        where: {
                            flagged: false,
                        },
                    },
                },
            },

            likes: {
                where: {
                    userId,
                },
                select: {
                    userId: true,
                },
            },

            reposts: {
                where: {
                    authorId: userId,
                },
                select: {
                    id: true,
                },
            },

            comments: {
                where: {
                    authorId: userId,
                },
                select: {
                    id: true,
                },
            },

            bookmarks: {
                where: {
                    userId,
                },
                select: {
                    userId: true,
                },
            },

            attachments: {
                select: {
                    name: true,
                    url: true,
                    type: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return posts.map((post) => ({
        id: post.id,
        author: post.author,
        content: post.content,

        repostOfId: post.repostOfId,
        repostOf: post.repostOf
            ? {
                id: post.repostOf.id,
                author: post.repostOf.author,
                content: post.repostOf.content,
                flagged: post.repostOf.flagged,
                edited: post.repostOf.edited,
                createdAt: post.repostOf.createdAt.toISOString(),
                updatedAt: post.repostOf.updatedAt.toISOString(),
                views: post.repostOf.views,
                attachments: post.repostOf.attachments,
            }
            : null,

        flagged: post.flagged,
        edited: post.edited,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        views: post.views,

        likes: post._count.likes,
        reposts: post._count.reposts,
        comments: post._count.comments,

        liked: post.likes.length > 0,
        reposted: post.reposts.length > 0,
        commented: post.comments.length > 0,
        bookmarked: post.bookmarks.length > 0,

        attachments: post.attachments,
    })) as Post[];
}

export async function fetchTrending() {
    const hashtags = await prisma.postHashtag.groupBy({
        by: ["tag"],
        where: {
            post: {
                flagged: false,
                author: {
                    banned: false,
                },
            },
        },
        _count: {
            tag: true,
        },
        orderBy: {
            _count: {
                tag: "desc",
            },
        },
        take: 3,
    });

    return hashtags.map((hashtag) => ({
        tag: hashtag.tag,
        count: hashtag._count.tag,
    }));
}

export async function getPost(postId: string, session: { user: { id: string } }) {
    const post = await prisma.post.findFirst({
        where: {
            id: postId,
            author: {
                banned: false,
            },
            OR: [
                {
                    repostOfId: null,
                },
                {
                    repostOf: {
                        author: {
                            banned: false,
                        },
                    },
                },
            ],
        },
        select: {
            id: true,
            author: {
                select: {
                    name: true,
                    username: true,
                    image: true,
                    verified: true,
                    role: true,
                },
            },
            authorId: true,
            content: true,
            repostOfId: true,
            repostOf: {
                select: {
                    id: true,
                    author: {
                        select: {
                            name: true,
                            username: true,
                            image: true,
                            verified: true,
                            role: true,
                        },
                    },
                    content: true,
                    flagged: true,
                    edited: true,
                    createdAt: true,
                    updatedAt: true,
                    views: true,
                    attachments: {
                        select: {
                            name: true,
                            url: true,
                            type: true,
                        },
                    },
                },
            },
            flagged: true,
            edited: true,
            createdAt: true,
            updatedAt: true,
            views: true,
            _count: {
                select: {
                    likes: true,
                    reposts: true,
                    comments: {
                        where: {
                            flagged: false,
                        }
                    },
                },
            },
            likes: {
                where: {
                    userId: session.user.id,
                },
                select: {
                    userId: true,
                },
            },
            reposts: {
                where: {
                    authorId: session.user.id,
                },
                select: {
                    id: true,
                },
            },
            comments: {
                where: {
                    authorId: session.user.id,
                },
                select: {
                    id: true,
                },
            },
            bookmarks: {
                where: {
                    userId: session.user.id,
                },
                select: {
                    userId: true,
                },
            },
            attachments: {
                select: {
                    name: true,
                    url: true,
                    type: true,
                },
            },
        },
    });

    return post
}

export async function getPostsByUserId(userId: string, session: { user: { id: string } }) {
    const posts = await prisma.post.findMany(
        {
            where: {
                authorId: userId,
                author: {
                    banned: false,
                },
                flagged: false,
                OR: [
                    {
                        repostOfId: null,
                    },
                    {
                        repostOf: {
                            author: {
                                banned: false,
                            },
                        },
                    },
                ],
            },
            select: {
                id: true,
                author: {
                    select: {
                        name: true,
                        username: true,
                        image: true,
                        verified: true,
                        role: true,
                    },
                },
                content: true,
                repostOfId: true,
                repostOf: {
                    select: {
                        id: true,
                        author: {
                            select: {
                                name: true,
                                username: true,
                                image: true,
                                verified: true,
                                role: true,
                            },
                        },
                        content: true,
                        flagged: true,
                        edited: true,
                        createdAt: true,
                        updatedAt: true,
                        views: true,
                        attachments: {
                            select: {
                                name: true,
                                url: true,
                                type: true,
                            },
                        },
                    },
                },
                flagged: true,
                edited: true,
                createdAt: true,
                updatedAt: true,
                views: true,
                _count: {
                    select: {
                        likes: true,
                        reposts: true,
                        comments: {
                            where: {
                                flagged: false,
                            }
                        },
                    },
                },
                likes: {
                    where: {
                        userId: session.user.id,
                    },
                    select: {
                        userId: true,
                    },
                },
                reposts: {
                    where: {
                        authorId: session.user.id,
                    },
                    select: {
                        id: true,
                    },
                },
                comments: {
                    where: {
                        authorId: session.user.id,
                    },
                    select: {
                        id: true,
                    },
                },
                bookmarks: {
                    where: {
                        userId: session.user.id,
                    },
                    select: {
                        userId: true,
                    },
                },
                attachments: {
                    select: {
                        name: true,
                        url: true,
                        type: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        }
    );

    return posts.map((post) => ({
        id: post.id,
        author: post.author,
        content: post.content,

        repostOfId: post.repostOfId,
        repostOf: post.repostOf
            ? {
                id: post.repostOf.id,
                author: post.repostOf.author,
                content: post.repostOf.content,
                flagged: post.repostOf.flagged,
                edited: post.repostOf.edited,
                createdAt: post.repostOf.createdAt.toISOString(),
                updatedAt: post.repostOf.updatedAt.toISOString(),
                views: post.repostOf.views,
                attachments: post.repostOf.attachments,
            }
            : null,

        flagged: post.flagged,
        edited: post.edited,
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
        views: post.views,

        likes: post._count.likes,
        reposts: post._count.reposts,
        comments: post._count.comments,

        liked: post.likes.length > 0,
        reposted: post.reposts.length > 0,
        commented: post.comments.length > 0,
        bookmarked: post.bookmarks.length > 0,

        attachments: post.attachments,
    })) as Post[];
}