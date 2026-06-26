"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Heart, Repeat2, MessagesSquare, BarChart2, Bookmark, Share, EyeOff, MoreHorizontal } from "lucide-react";
import { Markdown } from "@/components/md";
import { formatTimeAgo, useFormattedDate } from "@/client/utils";
import { Staff } from "./icons";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export interface Post {
    id: string;
    author: {
        name: string;
        handle: string;
        image: string;
        verified: boolean;
        staff: boolean;
    };
    content: string;
    flagged: boolean;
    edited: boolean;
    createdAt: string;
    views: number;
    likes: number;
    reposts: number;
    comments: number;
    repost?: {
        repost: boolean;
        by: {
            name: string;
            handle: string;
        }
    }
    quote?: {
        by: {
            name: string;
            handle: string;
        }
        post: {
            id: string;
            author: {
                name: string;
                handle: string;
                image: string;
                verified: boolean;
                staff: boolean;
            };
            content: string;
            flagged: boolean;
            edited: boolean;
            createdAt: string;
            attachments?: {
                name: string;
                url: string;
            }[]
        };
    }
    attachments?: {
        name: string;
        url: string;
    }[]
}

export interface PostActions {
    onComment?: () => void;
    onRepost?: () => void;
    onLike?: () => void;
    onBookmark?: () => void;
    onShare?: () => void;
    onAnalytics?: () => void;
    onReport?: () => void;
}

export function PostList({
    posts,
    ...actions
}: {
    posts: Post[];
} & PostActions) {
    return (
        <div className="flex flex-col gap-4 max-w-lg w-full">
            {posts.map((post) => (
                <Post key={post.id} post={post} {...actions} />
            ))}
        </div>
    );
}

export function Post({
    post,
    onComment,
    onRepost,
    onLike,
    onBookmark,
    onShare,
    onAnalytics,
    onReport,
}: {
    post: Post;
} & PostActions) {
    const router = useRouter();

    const handleCardClick = () => {
        router.push(`/post/${post.id}`);
    };

    const handleAction = (callback?: () => void) => (e: React.MouseEvent) => {
        e.stopPropagation();
        callback?.();
    };

    const timeAgo = formatTimeAgo(post.createdAt);
    const postedAt = useFormattedDate(post.createdAt);

    return (
        <div
            onClick={handleCardClick}
            className="rounded-md border-2 border-border max-w-lg bg-background p-4 flex flex-col gap-2 hover:border-primary/80 transition cursor-pointer"
        >
            {post.repost?.repost && (
                <div className="flex items-center gap-1 mb-2 text-sm">
                    <Repeat2 size={15} strokeWidth={3} className="text-primary" />
                    <span className="font-semibold text-xs text-primary">reposted by {post.repost.by.name} (@{post.repost.by.handle})</span>
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

                        {post.author.staff && (
                            <Staff />
                        )}

                        <span className="text-sm text-muted-foreground">
                            @{post.author.handle}
                        </span>

                        <span className="text-sm text-muted-foreground">
                            · {timeAgo} {post.edited && (
                                <span className="text-xs text-muted-foreground font-medium">(edited)</span>
                            )}
                        </span>

                        <span className="ml-auto shrink-0">
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
                                        onClick={handleAction(onReport)}
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

                    {post.quote && (
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/post/${post.quote!.post.id}`);
                            }}
                            className="rounded-md border-2 border-border max-w-lg bg-background p-4 flex flex-col gap-2 hover:border-primary/80 transition cursor-pointer"
                        >
                            <div className="flex gap-3">
                                <div className="shrink-0">
                                    <Image
                                        src={post.quote.post.author.image}
                                        alt={post.quote.post.author.name}
                                        width={28}
                                        height={28}
                                        unoptimized
                                        className="rounded-full"
                                    />
                                </div>

                                <div className="flex flex-col gap-2 min-w-0 flex-1">
                                    <div className="flex items-center gap-1 text-base font-semibold flex-wrap">
                                        <span className="text-primary">{post.quote.post.author.name}</span>

                                        {post.quote.post.author.verified && (
                                            <BadgeCheck
                                                className="h-[20px] w-[20px] fill-primary text-background"
                                            />
                                        )}

                                        {post.quote.post.author.staff && (
                                            <Staff />
                                        )}

                                        <span className="text-sm text-muted-foreground">
                                            @{post.quote.post.author.handle}
                                        </span>

                                        <span className="text-sm text-muted-foreground">
                                            · {formatTimeAgo(post.quote.post.createdAt)} {post.quote.post.edited && (
                                                <span className="text-xs text-muted-foreground font-medium">(edited)</span>
                                            )}
                                        </span>
                                    </div>

                                    {post.quote.post.flagged && (
                                        <div className="flex items-center gap-2 rounded-md border-2 dark:border-accent border-primary p-3">
                                            <EyeOff size={15} className="shrink-0 dark:text-accent text-primary" />
                                            <p className="text-sm dark:text-accent text-primary">
                                                This post has been unlisted by a moderator due to a violation of our community guidelines.
                                            </p>
                                        </div>
                                    )}

                                    <Markdown>
                                        {post.quote.post.content}
                                    </Markdown>

                                    {post.quote.post.attachments?.length ? (
                                        <div
                                            className={`grid gap-2 ${post.quote.post.attachments.length === 1
                                                ? "grid-cols-1"
                                                : "grid-cols-2"
                                                }`}
                                        >
                                            {post.quote.post.attachments.map((attachment, index) => (
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

                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-1.5">
                            <Button
                                onClick={handleAction(onComment)}
                                variant="default"

                                size="sm"
                                className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                            >
                                <MessagesSquare
                                    strokeWidth={3}
                                />

                                {post.comments}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        onClick={handleAction(onRepost)}
                                        variant="default"
                                        size="sm"
                                        className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
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
                                        onClick={handleAction(onRepost)}
                                        className="text-sm font-medium text-primary cursor-pointer rounded-sm data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                                    >
                                        Repost
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleAction(onRepost)}
                                        className="text-sm font-medium text-primary cursor-pointer rounded-sm data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                                    >
                                        Quote Repost
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                onClick={handleAction(onLike)}
                                variant="default"
                                size="sm"
                                className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                            >
                                <Heart
                                    strokeWidth={3}
                                    size={16}
                                />

                                {post.likes}
                            </Button>
                        </div>
                        <div className="ml-auto gap-1.5 flex">
                            <Button
                                onClick={handleAction(onAnalytics)}
                                variant="default"
                                size="sm"
                                className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                            >
                                <BarChart2
                                    strokeWidth={3}
                                    size={16}
                                />

                                {post.views}
                            </Button>
                            <Button
                                onClick={handleAction(onBookmark)}
                                variant="default"
                                size="sm"
                                className="h-8 py-1 px-1.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                            >
                                <Bookmark
                                    strokeWidth={3}
                                    size={16}
                                />
                            </Button>
                            <Button
                                onClick={handleAction(onShare)}
                                variant="default"
                                size="sm"
                                className="h-8 py-1 px-1.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
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