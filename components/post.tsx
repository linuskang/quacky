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

"use client"

// Libraries
import { useRef, useState } from "react"
import { authClient } from "@/client/auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"

import Image from "next/image"
import Link from "next/link"

import { useTimeAgo, useFormattedDate } from "@/client/utils"

// Components
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import {
  BadgeCheck,
  Heart,
  Repeat2,
  MessagesSquare,
  BarChart2,
  Bookmark,
} from "lucide-react"

import { Markdown } from "@/components/markdown-renderer"
import { Admin } from "@/components/icons"
import { CharCounter } from "@/components/character-counter"
import { MoreActions } from "@/components/more-actions"
import { PurpleEyeWarning } from "@/components/warning-cards"
import { SharePost } from "@/components/share"

// Types
import { EmbeddedPost, Post } from "@/types"
import { Card } from "./ui/card"

export function PostList({
  posts,
  afterFirst,
}: {
  posts: Post[]
  afterFirst?: React.ReactNode
}) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground">No posts yet.</p>
      ) : (
        posts.map((post, index) => (
          <div key={post.id} className="contents">
            <PostCard post={post} />
            {index === 0 && afterFirst}
          </div>
        ))
      )}
    </div>
  )
}

export function Feed({ posts }: { posts: Post[] }) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}

type PostCardPost = Post | EmbeddedPost

function isFullPost(post: PostCardPost): post is Post {
  return "likes" in post
}

export function PostCard({
  post,
  showActions = true,
}: {
  post: PostCardPost
  showActions?: boolean
}) {
  const router = useRouter()
  const fullPost = isFullPost(post) ? post : null
  const repostOf = fullPost?.repostOf ?? null

  // User States
  const [liked, setLiked] = useState(fullPost?.liked ?? false)
  const [likes, setLikes] = useState(fullPost?.likes ?? 0)
  const [bookmarked, setBookmarked] = useState(fullPost?.bookmarked ?? false)

  // Pending States
  const [likePending, setLikePending] = useState(false)
  const likePendingRef = useRef(false)
  const [bookmarkPending, setBookmarkPending] = useState(false)

  // Quote
  const [quoteRepostOpen, setQuoteRepostOpen] = useState(false)
  const [quoteContent, setQuoteContent] = useState("")
  const [quotePending, setQuotePending] = useState(false)

  const shareUrl = `/post/${post.id}`
  const { data: session } = authClient.useSession()

  const like = async () => {
    if (likePendingRef.current) return

    const nextLiked = !liked
    likePendingRef.current = true
    setLikePending(true)
    setLiked(nextLiked)
    setLikes((current) => current + (nextLiked ? 1 : -1))

    try {
      const res = await fetch(`/api/posts/${post.id}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          err?: string
        } | null
        setLiked(liked)
        setLikes(likes)
        toast.error(data?.err ?? "Failed to update like")
      }
    } catch {
      setLiked(liked)
      setLikes(likes)
      toast.error("Failed to update like")
    } finally {
      likePendingRef.current = false
      setLikePending(false)
    }
  }

  const repost = async () => {
    const res = await fetch(`/api/posts/repost`, {
      method: "POST",
      body: JSON.stringify({ postId: post.id }),
    })

    if (!res.ok) {
      toast.error(res.statusText)
    } else {
      toast.success("Reposted")
    }
  }

  const quote = async () => {
    const content = quoteContent.trim()

    if (!content || quotePending) return

    if (content.length > 400) {
      toast.error("Quote repost must be 400 characters or less.")
      return
    }

    setQuotePending(true)

    const res = await fetch(`/api/posts/quote`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        postId: post.id,
        content,
      }),
    })

    if (!res.ok) {
      const data = (await res.json().catch(() => null)) as {
        err?: string
      } | null
      toast.error(data?.err ?? res.statusText)
      setQuotePending(false)
      return
    }

    setQuoteContent("")
    setQuoteRepostOpen(false)
    setQuotePending(false)
    toast.success("Quote reposted")
  }

  const bookmark = async () => {
    if (bookmarkPending) return

    const nextBookmarked = !bookmarked
    setBookmarkPending(true)
    setBookmarked(nextBookmarked)

    const res = await fetch(`/api/posts/${post.id}/bookmark`, {
      method: nextBookmarked ? "POST" : "DELETE",
    })

    if (!res.ok) {
      toast.error(res.statusText)
    }

    setBookmarkPending(false)
  }

  const timeAgo = useTimeAgo(post.createdAt)
  const postedAt = useFormattedDate(post.createdAt)

  return (
    <Card
      onClick={(event) => {
        event.stopPropagation()
        router.push(`/post/${post.id}`)
      }}
      className="flex cursor-pointer flex-col gap-2 !bg-card-primary p-3 transition hover:border-primary/80"
    >
      {repostOf && !post.content && (
        <div className="mb-2 flex items-center gap-1 text-sm">
          <Repeat2 size={15} strokeWidth={3} className="text-primary" />
          <span className="text-xs font-semibold text-primary">
            reposted by @{post.author.username}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        <div className="shrink-0">
          <Image
            src={post.author.image}
            alt={post.author.name}
            width={28}
            height={28}
            unoptimized
            className="rounded-full"
          />
        </div>
        <div className="mb-0 flex min-w-0 flex-1 flex-col gap-1">
          <div className="-mb-2 flex min-w-0 items-start justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              <Link
                href={`/@${post.author.username}`}
                onClick={(event) => event.stopPropagation()}
                className="text-sm font-semibold text-primary hover:underline"
              >
                {post.author.name}
              </Link>

              {post.author.verified && (
                <BadgeCheck className="h-5 w-5 shrink-0 fill-primary text-background" />
              )}

              {post.author.role === "admin" && <Admin />}

              <Link
                href={`/@${post.author.username}`}
                onClick={(event) => event.stopPropagation()}
                className="text-sm font-semibold text-muted-foreground hover:underline"
              >
                @{post.author.username}
              </Link>

              {timeAgo && (
                <span className="text-sm text-muted-foreground">
                  · {timeAgo}
                </span>
              )}

              {post.edited && (
                <span className="text-xs font-medium text-muted-foreground">
                  (edited)
                </span>
              )}
            </div>
            {fullPost && <MoreActions post={fullPost} />}
          </div>

          {post.flagged && (
            <PurpleEyeWarning text="This post has been unlisted by a moderator due to a violation of our community guidelines." />
          )}
          <Markdown>{post.content}</Markdown>
          {repostOf && <PostCard showActions={false} post={repostOf} />}

          {post.attachments?.length ? (
            <div className="grid grid-cols-2 gap-2">
              {post.attachments.map((attachment, index) => (
                <Image
                  key={index}
                  src={attachment.url}
                  alt={attachment.name}
                  width={500}
                  height={300}
                  unoptimized
                  className="h-full max-h-[300px] w-full rounded-md object-cover"
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}

          <div className="text-xs text-muted-foreground">{postedAt}</div>

          {showActions && fullPost && (
            <div
              className="flex items-center justify-between pt-1"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-1.5">
                <Button
                  onClick={() => router.push(`/post/${post.id}`)}
                  variant="default"
                  size="sm"
                  className={cn(
                    "h-8 border-2 !bg-card-primary px-2.5 py-1 text-sm font-semibold hover:bg-background",
                    fullPost.commented
                      ? "border-primary !bg-primary !bg-clip-border text-background"
                      : "border-border text-primary/80 hover:border-primary hover:text-primary"
                  )}
                >
                  <MessagesSquare strokeWidth={3} />

                  {fullPost.comments}
                </Button>

                <Dialog
                  open={quoteRepostOpen}
                  onOpenChange={setQuoteRepostOpen}
                >
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className={cn(
                          "h-8 border-2 !bg-card-primary px-2.5 py-1 text-sm font-semibold hover:bg-background",
                          fullPost.reposted
                            ? "border-primary !bg-primary !bg-clip-border text-background"
                            : "border-border bg-card-primary text-primary/80 hover:border-primary hover:text-primary"
                        )}
                      >
                        <Repeat2 strokeWidth={3} size={16} />

                        {fullPost.reposts}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="min-w-[140px] rounded-md border-2 border-border bg-background shadow-none">
                      <DropdownMenuItem
                        onClick={repost}
                        className="cursor-pointer rounded-sm text-sm font-medium text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                      >
                        Repost
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onSelect={() => setQuoteRepostOpen(true)}
                        className="cursor-pointer rounded-sm text-sm font-medium text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                      >
                        Quote
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <DialogContent className="w-full !max-w-lg border-2 border-border bg-card-primary">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-start gap-2">
                        <Image
                          src={session?.user.image ?? "/default-avatar.png"}
                          alt={session?.user.name ?? "You"}
                          width={30}
                          height={30}
                          unoptimized
                          className="h-8 w-8 shrink-0 rounded-full object-cover"
                        />

                        <textarea
                          value={quoteContent}
                          onChange={(e) => setQuoteContent(e.target.value)}
                          placeholder="Add your thoughts..."
                          className="min-h-10 w-full bg-transparent py-1 text-lg leading-normal outline-none placeholder:text-muted-foreground"
                        />
                      </div>

                      <div className="ml-9 max-w-[calc(100%-2.25rem)] min-w-0">
                        <PostCard showActions={false} post={post} />
                      </div>

                      <div className="flex items-center justify-end gap-2">
                        <CharCounter
                          length={quoteContent.length}
                          maxLength={400}
                        />

                        <Button
                          size="sm"
                          disabled={
                            !quoteContent.trim() ||
                            quoteContent.length > 400 ||
                            quotePending
                          }
                          onClick={quote}
                          className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                        >
                          {quotePending ? "Posting..." : "Post"}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <Button
                  onClick={like}
                  disabled={likePending}
                  variant="default"
                  size="sm"
                  className={cn(
                    "h-8 border-2 !bg-card-primary px-2.5 py-1 text-sm font-semibold hover:bg-background",
                    liked
                      ? "border-primary !bg-primary !bg-clip-border text-background"
                      : "border-border text-primary/80 hover:border-primary hover:text-primary"
                  )}
                >
                  <Heart
                    strokeWidth={3}
                    size={16}
                    fill={liked ? "currentColor" : "none"}
                  />

                  {likes}
                </Button>
              </div>
              <div className="ml-auto flex gap-1.5">
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 border-2 border-border !bg-card-primary px-2.5 py-1 text-sm font-semibold text-primary/80 hover:border-primary hover:bg-background hover:text-primary"
                >
                  <BarChart2 strokeWidth={3} size={16} />

                  {fullPost.views}
                </Button>
                <Button
                  onClick={bookmark}
                  disabled={bookmarkPending}
                  variant="default"
                  size="sm"
                  className={cn(
                    "h-8 border-2 !bg-card-primary px-1.5 py-1 text-sm font-semibold hover:bg-background",
                    bookmarked
                      ? "border-primary !bg-primary !bg-clip-border text-background"
                      : "border-border text-primary/80 hover:border-primary hover:text-primary"
                  )}
                >
                  <Bookmark
                    strokeWidth={3}
                    size={16}
                    fill={bookmarked ? "currentColor" : "none"}
                  />
                </Button>
                <SharePost shareUrl={shareUrl} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
