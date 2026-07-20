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
import axios from "axios"
import { useState } from "react"
import { authClient } from "@/client/auth"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

// Components
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import {
    BadgeCheck,
    Heart,
    Repeat2,
    MessagesSquare,
    BarChart2,
    Bookmark,
    Share2,
} from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Markdown } from "@/components/markdown-renderer"
import { Admin } from "@/components/icons"
import { CharCounter } from "@/components/character-counter"
import { MoreActions } from "@/components/posts/more-actions"
import { PurpleEyeWarning } from "@/components/warning-cards"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Types
import { EmbeddedPost, Post } from "@/types"
import { Card } from "@/components/ui/card"
import { Input } from "../ui/input"

// Utilies
import { useTimeAgo, useFormattedDate } from "@/client/utils"

// Legacy
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

// New
export function Feed({ posts }: { posts: Post[] }) {
    return (
        <div className="flex w-full max-w-lg flex-col gap-4">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    )
}

// [NOTE_TO_SELF]:
// determine whether its a quote or post.
// doing this because dont need to rewrite code twice,
// just use the Post component as embed for Quotes
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
    const timeAgo = useTimeAgo(post.createdAt)
    const postedAt = useFormattedDate(post.createdAt)

    const router = useRouter()
    const fullPost = isFullPost(post) ? post : null
    const repostOf = fullPost?.repostOf ?? null

    // User States
    const [liked, setLiked] = useState(fullPost?.liked ?? false)
    const [likePending, setLikePending] = useState(false)
    const [likes, setLikes] = useState(fullPost?.likes ?? 0)
    const [bookmarked, setBookmarked] = useState(fullPost?.bookmarked ?? false)
    const [bookmarkPending, setBookmarkPending] = useState(false)
    const [quoteRepostOpen, setQuoteRepostOpen] = useState(false)
    const [quoteContent, setQuoteContent] = useState("")
    const [quotePending, setQuotePending] = useState(false)

    const shareUrl = `${window.location.origin}/post/${post.id}`

    const { data: session } = authClient.useSession()

    if (!session) return null

    async function like() {
        const nextLiked = !liked
        setLikePending(true)
        setLiked(nextLiked)
        setLikes(likes + (nextLiked ? 1 : -1))
        try {
            if (nextLiked) {
                await axios.post(`/api/posts/${post.id}/like`)
            } else {
                await axios.delete(`/api/posts/${post.id}/like`)
            }
        } catch {
            setLiked(liked)
            setLikes(likes)
            toast.error("Something went wrong")
        } finally {
            setLikePending(false)
        }
    }

    async function repost() {
        try {
            await axios.post(`/api/posts/repost`, {
                postId: post.id,
            })
            toast.success("Reposted")
        } catch {
            toast.error("Something went wrong")
        } finally {
            setQuoteRepostOpen(false)
        }
    }

    async function quote() {
        const content = quoteContent.trim()
        setQuotePending(true)
        try {
            await axios.post(`/api/posts/quote`, {
                postId: post.id,
                content,
            })
            toast.success("Quote reposted")
        } catch {
            toast.error("Something went wrong")
        } finally {
            setQuotePending(false)
            setQuoteRepostOpen(false)
        }
    }

    const bookmark = async () => {
        const nextBookmarked = !bookmarked
        setBookmarkPending(true)
        setBookmarked(nextBookmarked)
        try {
            if (nextBookmarked) {
                await axios.post(`/api/posts/${post.id}/bookmark`)
            } else {
                await axios.delete(`/api/posts/${post.id}/bookmark`)
            }
        } catch {
            setBookmarked(bookmarked)
            toast.error("Something went wrong")
        } finally {
            setBookmarkPending(false)
        }
    }

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
                    <Repeat2
                        size={15}
                        strokeWidth={3}
                        className="text-primary"
                    />
                    <span className="text-xs font-semibold text-primary">
                        reposted by @{post.author.username}
                    </span>
                </div>
            )}

            <div className="flex gap-2">
                <div className="shrink-0">
                    <Avatar className="size-7">
                        {post.author.image && (
                            <AvatarImage
                                src={post.author.image}
                                alt={post.author.name}
                            />
                        )}
                        <AvatarFallback>
                            {post.author.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
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
                    {repostOf && (
                        <PostCard showActions={false} post={repostOf} />
                    )}

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

                    <div className="text-xs text-muted-foreground">
                        {postedAt}
                    </div>

                    {showActions && fullPost && (
                        <div
                            className="flex items-center justify-between pt-1"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-1.5">
                                <Button
                                    onClick={() =>
                                        router.push(`/post/${post.id}`)
                                    }
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
                                                <Repeat2
                                                    strokeWidth={3}
                                                    size={16}
                                                />

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
                                                onSelect={() =>
                                                    setQuoteRepostOpen(true)
                                                }
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
                                                    src={session.user.image || ""}
                                                    alt={session.user.name || ""}
                                                    width={30}
                                                    height={30}
                                                    unoptimized
                                                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                                                />
                                                <Textarea
                                                    value={quoteContent}
                                                    onChange={(e) =>
                                                        setQuoteContent(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="Add your thoughts..."
                                                    className="min-h-20 w-full !border-none !bg-transparent py-1 !text-lg placeholder:text-muted-foreground"
                                                />
                                            </div>

                                            <div className="ml-9 max-w-[calc(100%-2.25rem)] min-w-0">
                                                <PostCard
                                                    showActions={false}
                                                    post={post}
                                                />
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
                                                        quoteContent.length >
                                                        400 ||
                                                        quotePending
                                                    }
                                                    onClick={quote}
                                                    className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                                                >
                                                    {quotePending
                                                        ? "Posting..."
                                                        : "Post"}
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
                                        fill={
                                            bookmarked ? "currentColor" : "none"
                                        }
                                    />
                                </Button>
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="text-md h-8 border-2 border-border !bg-card-primary px-1.5 py-1 font-semibold text-primary/80 hover:border-primary hover:bg-background hover:text-primary"
                                        >
                                            <Share2 strokeWidth={3} size={16} />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent
                                        className="w-full !max-w-lg border-2 border-border bg-card-primary"
                                        showCloseButton={false}
                                    >
                                        <DialogHeader>
                                            <DialogTitle className="text-lg font-bold text-primary">
                                                Share post
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="flex flex-col gap-3 sm:flex-row">
                                            <Input
                                                value={shareUrl}
                                                readOnly
                                                onFocus={(e) => e.target.select()}
                                                className="h-10 w-full rounded-full border-2 border-border !ring-0"
                                            />
                                            <Button
                                                type="button"
                                                onClick={async () => {
                                                    await navigator.clipboard.writeText(shareUrl)
                                                    toast.success("Copied link")
                                                }}
                                                className="h-10 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                                            >
                                                Copy
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
