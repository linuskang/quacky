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

import { prisma } from "@/server/prisma"
import { getSession } from "@/server/auth"
import { NextRequest, NextResponse } from "next/server"
import type { Comment, Post, User } from "@/types"
import { NotificationService } from "@/server/helpers"
import { deleteComment, getComment, getCommentByPostId } from "@/server/comment"
import { getPost } from "@/server/posts"
import type { Attachment } from "@/types"
import { xp } from "@/lib/var"
import { removeXP } from "@/server/users"

type PrismaUser = Omit<User, "role"> & {
  role: string | null
}

type CommentPageResponse = {
  comment: Comment
  post: Post
}

function serializeUser(
  user: PrismaUser,
  followingIds = new Set<string>()
): User {
  return {
    ...user,
    role: user.role ?? undefined,
    following: user.id ? followingIds.has(user.id) : false,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        err: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const { id } = await params

  const comment = await getComment(id)

  if (!comment) {
    return NextResponse.json(
      {
        err: "Comment not found",
      },
      {
        status: 404,
      }
    )
  }

  const post = await getPost(comment.postId, session)

  if (!post) {
    return NextResponse.json(
      {
        err: "Post not found",
      },
      {
        status: 404,
      }
    )
  }

  const postComments = await getCommentByPostId(post.id)

  const relevantUserIds = Array.from(
    new Set(
      [
        post.author.id,
        comment.author.id,
        ...postComments.map((postComment) => postComment.author.id),
      ].filter(Boolean)
    )
  )
  const following = await prisma.follow.findMany({
    where: {
      userId: session.user.id,
      followId: {
        in: relevantUserIds,
      },
    },
    select: {
      followId: true,
    },
  })
  const followingIds = new Set(following.map((follow) => follow.followId))

  const postView = await prisma.postView.createMany({
    data: [
      {
        userId: session.user.id,
        postId: post.id,
      },
    ],
    skipDuplicates: true,
  })

  if (postView.count === 1) {
    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    })
  }

  const res: CommentPageResponse = {
    comment: {
      id: comment.id,
      postId: comment.postId,
      author: serializeUser(comment.author, followingIds),
      content: comment.content,
      flagged: comment.flagged,
      createdAt: comment.createdAt.toISOString(),
      updatedAt: comment.updatedAt.toISOString(),
    },
    post: {
      id: post.id,
      author: serializeUser(post.author, followingIds),
      content: post.content,
      repostOfId: post.repostOfId,
      repostOf: post.repostOf
        ? {
            id: post.repostOf.id,
            author: serializeUser(post.repostOf.author, followingIds),
            content: post.repostOf.content,
            flagged: post.repostOf.flagged,
            edited: post.repostOf.edited,
            createdAt: post.repostOf.createdAt.toISOString(),
            updatedAt: post.repostOf.updatedAt.toISOString(),
            views: post.repostOf.views,
            attachments: post.repostOf.attachments.map(
              (attachment: Attachment) => ({
                name: attachment.name,
                url: attachment.url,
                type: attachment.type,
              })
            ),
          }
        : null,
      flagged: post.flagged,
      edited: post.edited,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      views: post.views + postView.count,
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
      postComments: postComments.map((postComment) => ({
        id: postComment.id,
        postId: postComment.postId,
        author: serializeUser(postComment.author, followingIds),
        content: postComment.content,
        flagged: postComment.flagged,
        createdAt: postComment.createdAt.toISOString(),
        updatedAt: postComment.updatedAt.toISOString(),
      })),
    },
  }

  return NextResponse.json(res)
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        err: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const { id } = await params

  const comment = await getComment(id)

  if (!comment) {
    return NextResponse.json(
      {
        err: "Comment not found",
      },
      {
        status: 404,
      }
    )
  }

  if (comment.authorId !== session.user.id && session.user.role !== "admin") {
    return NextResponse.json(
      {
        err: "You are not the author of this comment",
      },
      {
        status: 403,
      }
    )
  }

  await deleteComment(id)

  await removeXP(session.user.username, xp.comment)

  await NotificationService.removeEngagement(
    "comment",
    comment.post.authorId,
    comment.authorId,
    comment.postId
  )

  return NextResponse.json(
    {
      success: true,
      postId: comment.postId,
    },
    {
      status: 200,
    }
  )
}
