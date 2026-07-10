//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import "server-only"

import { prisma } from "@/server/prisma"
import type { Post } from "@/types"

export async function fetchBookmarks({ userId }: { userId: string }) {
  const bookmarks = await prisma.bookmark.findMany({
    where: {
      userId,
      post: {
        flagged: false,
        author: {
          banned: false,
        },
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
    },
    select: {
      post: {
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
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return bookmarks.map(({ post }) => ({
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
          attachments: post.repostOf.attachments.map((attachment) => ({
            name: attachment.name,
            url: attachment.url,
            type: attachment.type,
          })),
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

    attachments: post.attachments.map((attachment) => ({
      name: attachment.name,
      url: attachment.url,
      type: attachment.type,
    })),
  })) as Post[]
}
