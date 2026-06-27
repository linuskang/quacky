"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Heart, Repeat2, MessagesSquare, BarChart2, Bookmark, Share, EyeOff, MoreHorizontal } from "lucide-react";
import { Markdown } from "@/components/md";
import { formatTimeAgo, useFormattedDate } from "@/client/utils";
import { Admin } from "./icons";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { EmbeddedPost, Post } from "@/types";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { authClient } from "@/client/auth";
import { CharCounter } from "./char-counter";

export function PostList({
    posts,
}: {
    posts: Post[];
}) {
    return (
        <div className="flex flex-col gap-4 max-w-lg w-full">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}

function QuotedPostPreview({
    post,
}: {
    post: Post | EmbeddedPost;
}) {
    return (
        <div className="rounded-md border-2 border-border bg-card-primary p-3">
            <div className="flex gap-3">
                <Image
                    src={post.author.image}
                    alt={post.author.name}
                    width={28}
                    height={28}
                    unoptimized
                    className="h-7 w-7 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1 text-sm font-semibold">
                        <span className="text-primary">{post.author.name}</span>
                        {post.author.verified && (
                            <BadgeCheck className="h-4 w-4 fill-primary text-background" />
                        )}
                        {post.author.role == "admin" && <Admin />}
                        <span className="text-muted-foreground">@{post.author.username}</span>
                        <span className="text-muted-foreground">· {formatTimeAgo(post.createdAt)}</span>
                    </div>

                    {post.content.trim() ? (
                        <div className="mt-2 text-sm">
                            <Markdown>{post.content}</Markdown>
                        </div>
                    ) : "repostOf" in post && post.repostOf ? null : (
                        <p className="mt-2 text-sm text-muted-foreground">No content.</p>
                    )}

                    {"repostOf" in post && post.repostOf && (
                        <div className="mt-3">
                            <QuotedPostPreview post={post.repostOf} />
                        </div>
                    )}

                    {post.attachments?.length ? (
                        <div
                            className={`mt-2 grid gap-2 ${post.attachments.length === 1
                                ? "grid-cols-1"
                                : "grid-cols-2"
                                }`}
                        >
                            {post.attachments.map((attachment, index) => (
                                <Image
                                    key={index}
                                    src={attachment.url}
                                    alt={attachment.name}
                                    width={500}
                                    height={300}
                                    unoptimized
                                    className="h-full max-h-[200px] w-full rounded-md object-cover"
                                />
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

export function PostCard({
    post,
}: {
    post: Post;
}) {
    const router = useRouter();
    const [liked, setLiked] = useState(post.liked ?? false);
    const [likes, setLikes] = useState(post.likes);
    const [bookmarked, setBookmarked] = useState(post.bookmarked ?? false);
    const [likePending, setLikePending] = useState(false);
    const [bookmarkPending, setBookmarkPending] = useState(false);
    const [quoteRepostOpen, setQuoteRepostOpen] = useState(false);
    const [quoteContent, setQuoteContent] = useState("");
    const [quotePending, setQuotePending] = useState(false);
    const { data: session } = authClient.useSession();

    const handleCardClick = () => {
        router.push(`/post/${post.id}`);
    };

    const handleLike = async () => {
        if (likePending) return;

        const nextLiked = !liked;
        setLikePending(true);
        setLiked(nextLiked);
        setLikes((current) => current + (nextLiked ? 1 : -1));

        const res = await fetch(`/api/posts/${post.id}/like`, {
            method: nextLiked ? "POST" : "DELETE",
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null) as { err?: string } | null;
            setLiked(liked);
            setLikes(likes);
            toast.error(data?.err ?? "Failed to update like");
        }

        setLikePending(false);
    };

    const repost = async () => {
        const res = await fetch(`/api/posts/repost`, {
            method: "POST",
            body: JSON.stringify({ postId: post.id }),
        });

        if (!res.ok) {
            toast.error(res.statusText);
        } else {
            toast.success("Reposted");
        }
    }

    const quoteRepost = async () => {
        const content = quoteContent.trim();

        if (!content || quotePending) return;

        if (content.length > 400) {
            toast.error("Quote repost must be 400 characters or less.");
            return;
        }

        setQuotePending(true);

        const res = await fetch(`/api/posts/quote`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                postId: post.id,
                content,
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null) as { err?: string } | null;
            toast.error(data?.err ?? res.statusText);
            setQuotePending(false);
            return;
        }

        setQuoteContent("");
        setQuoteRepostOpen(false);
        setQuotePending(false);
        toast.success("Quote reposted");
    }

    const handleBookmark = async () => {
        if (bookmarkPending) return;

        const nextBookmarked = !bookmarked;
        setBookmarkPending(true);
        setBookmarked(nextBookmarked);

        const res = await fetch(`/api/posts/${post.id}/bookmark`, {
            method: nextBookmarked ? "POST" : "DELETE",
        });

        if (!res.ok) {
            toast.error(res.statusText);
        }

        setBookmarkPending(false);
    };

    const timeAgo = formatTimeAgo(post.createdAt);
    const postedAt = useFormattedDate(post.createdAt);

    return (
        <div
            onClick={handleCardClick}
            className="rounded-md border-2 border-border max-w-lg !bg-card-primary p-4 flex flex-col gap-2 hover:border-primary/80 transition cursor-pointer"
        >
            {post.repostOf && !post.content && (
                <div className="flex items-center gap-1 mb-2 text-sm">
                    <Repeat2 size={15} strokeWidth={3} className="text-primary" />
                    <span className="font-semibold text-xs text-primary">reposted by {post.author.name} (@{post.author.username})</span>
                </div>
            )}

            <div className="flex gap-3">
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

                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-base font-semibold flex-wrap">
                        <span className="text-primary">{post.author.name}</span>

                        {post.author.verified && (
                            <BadgeCheck
                                className="h-[20px] w-[20px] fill-primary text-background"
                            />
                        )}

                        {post.author.role == "admin" && (
                            <Admin />
                        )}

                        <span className="text-sm text-muted-foreground">
                            @{post.author.username}
                        </span>

                        <span className="text-sm text-muted-foreground">
                            · {timeAgo} {post.edited && (
                                <span className="text-xs text-muted-foreground font-medium">(edited)</span>
                            )}
                        </span>

                        <span
                            className="ml-auto shrink-0"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                                    >
                                        <MoreHorizontal size={16} />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="bg-background border-2 border-border rounded-md shadow-none min-w-[140px]"
                                >
                                    <DropdownMenuItem
                                        onClick={() => toast("Report feature is not implemented yet.")}
                                        className="text-sm font-medium text-primary cursor-pointer rounded-sm data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                                    >
                                        Report
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </span>
                    </div>

                    {post.flagged && (
                        <div className="flex items-center gap-2 rounded-md border-2 dark:border-accent border-primary p-3">
                            <EyeOff size={15} className="shrink-0 dark:text-accent text-primary" />
                            <p className="text-sm dark:text-accent text-primary">
                                This post has been unlisted by a moderator due to a violation of our community guidelines.
                            </p>
                        </div>
                    )}

                    <Markdown>
                        {post.content}
                    </Markdown>

                    {post.repostOf && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/post/${post.repostOf!.id}`);
                            }}
                            className="rounded-md border-2 border-border max-w-lg dark:bg-card-primary bg-card p-4 flex flex-col gap-2 hover:border-primary/80 transition cursor-pointer"
                        >
                            <div className="flex gap-3">
                                <div className="shrink-0">
                                    <Image
                                        src={post.repostOf!.author.image}
                                        alt={post.repostOf!.author.name}
                                        width={28}
                                        height={28}
                                        unoptimized
                                        className="rounded-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 min-w-0 flex-1">
                                    <div className="flex items-center gap-1 text-base font-semibold flex-wrap">
                                        <span className="text-primary">{post.repostOf!.author.name}</span>

                                        {post.repostOf!.author.verified && (
                                            <BadgeCheck
                                                className="h-[20px] w-[20px] fill-primary text-background"
                                            />
                                        )}

                                        {post.repostOf!.author.role == "admin" && (
                                            <Admin />
                                        )}

                                        <span className="text-sm text-muted-foreground">
                                            @{post.repostOf!.author.username}
                                        </span>

                                        <span className="text-sm text-muted-foreground">
                                            · {formatTimeAgo(post.repostOf!.createdAt)} {post.repostOf!.edited && (
                                                <span className="text-xs text-muted-foreground font-medium">(edited)</span>
                                            )}
                                        </span>
                                    </div>

                                    {post.repostOf!.flagged && (
                                        <div className="flex items-center gap-2 rounded-md border-2 dark:border-accent border-primary p-3">
                                            <EyeOff size={15} className="shrink-0 dark:text-accent text-primary" />
                                            <p className="text-sm dark:text-accent text-primary">
                                                This post has been unlisted by a moderator due to a violation of our community guidelines.
                                            </p>
                                        </div>
                                    )}

                                    <Markdown>
                                        {post.repostOf!.content}
                                    </Markdown>

                                    {post.repostOf!.attachments?.length ? (
                                        <div
                                            className={`grid gap-2 ${post.repostOf!.attachments.length === 1
                                                ? "grid-cols-1"
                                                : "grid-cols-2"
                                                }`}
                                        >
                                            {post.repostOf!.attachments.map((attachment, index) => (
                                                <Image
                                                    key={index}
                                                    src={attachment.url}
                                                    alt={attachment.name}
                                                    width={500}
                                                    height={300}
                                                    unoptimized
                                                    className="h-full max-h-[300px] w-full rounded-md object-cover"
                                                />
                                            ))}
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                        </div>
                    )}

                    {post.attachments?.length ? (
                        <div
                            className={`grid gap-2 ${post.attachments.length === 1
                                ? "grid-cols-1"
                                : "grid-cols-2"
                                }`}
                        >
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
                        {postedAt ? `Posted ${postedAt}` : `Posted ${post.createdAt}`}
                    </div>

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
                                    "h-8 px-2.5 py-1 text-md font-semibold !bg-card-primary border-2 hover:bg-background",
                                    post.commented
                                        ? "border-primary text-primary"
                                        : "border-border text-primary/80 hover:border-primary hover:text-primary"
                                )}
                            >
                                <MessagesSquare
                                    strokeWidth={3}
                                />

                                {post.comments}
                            </Button>

                            <Dialog open={quoteRepostOpen} onOpenChange={setQuoteRepostOpen}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className={cn(
                                                "h-8 px-2.5 py-1 text-md font-semibold !bg-card-primary border-2 hover:bg-background",
                                                post.reposted
                                                    ? "border-primary text-primary"
                                                    : "border-border text-primary/80 hover:border-primary hover:text-primary"
                                            )}
                                        >
                                            <Repeat2
                                                strokeWidth={3}
                                                size={16}
                                            />

                                            {post.reposts}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                        className="bg-background border-2 border-border rounded-md shadow-none min-w-[140px]"
                                    >
                                        <DropdownMenuItem
                                            onClick={repost}
                                            className="text-sm font-medium text-primary cursor-pointer rounded-sm data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                                        >
                                            Repost
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onSelect={() => setQuoteRepostOpen(true)}
                                            className="text-sm font-medium text-primary cursor-pointer rounded-sm data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                                        >
                                            Quote
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <DialogContent className="bg-card-primary border-2 border-border w-full !max-w-lg">

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-start gap-4">
                                            <Image
                                                src={session?.user.image ?? "/default-avatar.png"}
                                                alt={session?.user.name ?? "You"}
                                                width={40}
                                                height={40}
                                                unoptimized
                                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                            />

                                            <textarea
                                                value={quoteContent}
                                                onChange={(e) => setQuoteContent(e.target.value)}
                                                placeholder="Add your thoughts..."
                                                className="min-h-10 w-full bg-transparent py-1 text-lg leading-normal outline-none placeholder:text-muted-foreground"
                                            />
                                        </div>

                                        <div className="ml-14">
                                            <QuotedPostPreview post={post} />
                                        </div>

                                        <div className="flex items-center justify-end gap-2">
                                            <CharCounter length={quoteContent.length} maxLength={400} />

                                            <Button
                                                size="sm"
                                                disabled={!quoteContent.trim() || quoteContent.length > 400 || quotePending}
                                                onClick={quoteRepost}
                                                className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                                            >
                                                {quotePending ? "Posting..." : "Post"}
                                            </Button>
                                        </div>
                                    </div>
                                </DialogContent>

                            </Dialog>

                            <Button
                                onClick={handleLike}
                                disabled={likePending}
                                variant="default"
                                size="sm"
                                className={cn(
                                    "h-8 px-2.5 py-1 text-md font-semibold !bg-card-primary border-2 hover:bg-background",
                                    liked
                                        ? "border-primary text-primary"
                                        : "border-border text-primary/80 hover:border-primary hover:text-primary"
                                )}
                            >
                                <Heart
                                    strokeWidth={3}
                                    size={16}
                                />

                                {likes}
                            </Button>
                        </div>
                        <div className="ml-auto gap-1.5 flex">
                            <Button
                                variant="default"
                                size="sm"
                                className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary !bg-card-primary border-2 border-border hover:bg-background hover:border-primary"
                            >
                                <BarChart2
                                    strokeWidth={3}
                                    size={16}
                                />

                                {post.views}
                            </Button>
                            <Button
                                onClick={handleBookmark}
                                disabled={bookmarkPending}
                                variant="default"
                                size="sm"
                                className={cn(
                                    "h-8 px-1.5 py-1 text-md font-semibold !bg-card-primary border-2 hover:bg-background",
                                    bookmarked
                                        ? "border-primary text-primary"
                                        : "border-border text-primary/80 hover:border-primary hover:text-primary"
                                )}
                            >
                                <Bookmark
                                    strokeWidth={3}
                                    size={16}
                                />
                            </Button>
                            <Button
                                onClick={() => toast("Share feature is not implemented yet.")}
                                variant="default"
                                size="sm"
                                className="h-8 py-1 px-1.5 text-md font-semibold text-primary/80 hover:text-primary !bg-card-primary border-2 border-border hover:bg-background hover:border-primary"
                            >
                                <Share
                                    strokeWidth={3}
                                    size={16}
                                />
                            </Button>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    )
}
