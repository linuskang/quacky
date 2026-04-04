// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/client/auth";
import { useState } from "react";

// UI Components
import { BadgeCheck, MoreHorizontal, Pin, Lock, Heart, Repeat, Share2, Copy, Check, MessagesSquare, EyeOff } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ReportAbuse } from "@/components/quacky/report";
function Action({
    icon,
    count,
    onClick,
    active,
    activeClassName = "border-red-500 text-red-500",
    defaultClassName = "border-primary text-primary hover:bg-primary",
    hoverTextClassName = "group-hover:text-[var(--lynt)]"
}: {
    icon: React.ReactNode;
    count: number;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    active?: boolean;
    activeClassName?: string;
    defaultClassName?: string;
    hoverTextClassName?: string;
}) {
    return (
        <button
            onClick={(e) => {
                e.stopPropagation();
                onClick?.(e);
            }}
            className={`cursor-pointer group flex items-center gap-1 px-2 py-1 rounded-lg border-2 transition ${active ? activeClassName : defaultClassName}`}
        >
            <span className={`[&>svg]:stroke-[3px] transition ${active ? '' : hoverTextClassName}`}>
                {icon}
            </span>
            <span className={`font-medium transition ${active ? '' : hoverTextClassName}`}>{count}</span>
        </button>
    );
}

// Utilities
import {
    formatSize,
    formatTimestamp,
} from "@/client/utils";

// Types
import { Post } from "@/types";
interface Props {
    posts: Post[];
}

export default function Posts(
    { posts }: Props
) {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    // Sorts all posts with pinned at top, along with all other posts.
    function sort(posts: Post[]) {
        return [...posts].sort((a, b) => {
            // 1. Add pinned posts to the top (by timestamp)
            if (a.pinned !== b.pinned) {
                return b.pinned ? 1 : -1;
            }

            // 2. Sort all other social posts by timestamp
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    // None
    if (posts.length === 0) {
        return (
            <div className="p-6 w-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                    <h3 className="text-lg font-semibold text-primary">No posts to show</h3>
                    <p className="text-sm text-muted-foreground mt-1">In the meantime, here is a picture of a bird.</p>
                    <img
                        src="/assets/logo/sleepy.png"
                        alt="No posts"
                        className="w-48 h-48 object-contain mx-auto mt-3"
                    />
                </div>
            </div>
        )
    }

    return (
        // Return the list of posts, sorted.
        <div className="w-full flex flex-col gap-4">
            {sort(posts).map((post) => (
                <PostCard key={post.id} post={post} session={session} router={router} />
            ))}
        </div>
    );
}

// Post cards, used for displaying posts in the social media feed.
function PostCard(
    {
        post,
        session,
        router
    }: {
        post: Post;
        session: any;
        router: any
    }
) {
    // states
    const [isOpen, setIsOpen] = useState(false);
    const initialHasLiked = post.hasLiked ?? post.likes?.some((like) => like.user.id === session?.user?.id) ?? false;
    const initialHasCommented = post.hasReplied ?? post.replies?.some((reply) => reply.author.id === session?.user?.id) ?? false;
    const [hasLiked, setHasLiked] = useState(initialHasLiked);
    const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);

    async function report(type: string, reason: string) {
        fetch(`/api/v1/posts/${post.id}/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                type,
                reason,
            }),
        });
    }


    async function toggleLike() {
        if (!session) {
            router.push("/login");
            return;
        }

        const nextHasLiked = !hasLiked;
        setHasLiked(nextHasLiked);
        setLikeCount((current) => current + (nextHasLiked ? 1 : -1));

        const response = await fetch(`/api/v1/posts/${post.id}/${hasLiked ? "unlike" : "like"}`, {
            method: "POST",
        });

        if (!response.ok) {
            setHasLiked(!nextHasLiked);
            setLikeCount((current) => current + (nextHasLiked ? -1 : 1));
        }
    }

    const hasCommented = initialHasCommented;

    return (
        <div className="rounded-xl border border-border bg-[var(--lynt)] p-4 flex flex-col gap-2">
            {/* {post.repostedBy && (
                <div className="flex items-center gap-2 mb-1 text-muted-foreground text-sm">
                    <Repeat size={15} className="text-primary" />
                    <span>
                        <Link href={`/${post.repostedBy.handle}`} className="font-bold text-primary hover:underline">
                            {post.repostedBy.name}
                        </Link>{" "}
                        reposted
                    </span>
                </div>
            )} */}

            {post.pinned && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Pin fill="currentColor" size={16} className="text-primary" />
                    <span className="font-bold">Pinned by an admin</span>
                </div>
            )}

            <div className="flex items-center gap-2">
                <Avatar className="w-7 h-7">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {post.author.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <Link href={`/${post.author.handle}`} className="font-bold text-primary hover:underline">
                    {post.author.name}
                </Link>

                {post.author.verified && (
                    <div className="p-0 -ml-1">
                        <BadgeCheck
                            className="text-primary"
                            size={23}
                            fill="currentColor"
                            stroke="var(--lynt)"
                        />
                    </div>
                )}

                <span className="text-muted-foreground text-sm -ml-1 font-bold">
                    @{post.author.handle} • {formatTimestamp(post.createdAt)}
                </span>

                <div className="ml-auto flex items-center gap-2">
                    {post.readOnly && (
                        <div className="flex items-center gap-1 text-muted-foreground text-sm">
                            <Lock size={16} className="text-muted-foreground" />
                            <span className="font-bold">Read Only</span>
                        </div>
                    )}

                    <Dialog>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="cursor-pointer p-2 rounded-full hover:bg-primary/10 transition">
                                    <MoreHorizontal size={18} />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setIsOpen(true)}>
                                    <span>Report</span>
                                </DropdownMenuItem>
                                {session?.user?.role == "Admin" && (
                                    <>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                        >
                                            <span>{post.pinned ? "Unpin" : "Pin"}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                        >
                                            <span>{post.isHidden ? "List Post" : "Unlist"}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                        >
                                            <span>{post.readOnly ? "Disable Read Only" : "Read Only"}</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer"
                                        >
                                            <span>Delete Post</span>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </Dialog>
                </div>
            </div>

            {post.isHidden && (
                <div className="mt-1 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                    <EyeOff size={16} className="shrink-0 text-red-700" />
                    <p className="text-sm text-red-700">
                        This post has been unlisted due to a violation of our community guidelines. <a href="/help/unlisted" className="underline">Learn More</a>
                    </p>
                </div>
            )}

            <div
                onClick={() => router.push(`/post/${post.id}`)}
                className="cursor-pointer rounded-md p-1 -m-1 hover:bg-white/5 transition"
            >
                <p className="whitespace-pre-wrap">{post.content}</p>
            </div>

            {post.attachments && post.attachments.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {post.attachments.map((a) => (
                        <div key={a.key} className="border rounded-lg overflow-hidden">
                            {a.kind === "image" ? (
                                <img
                                    src={a.url}
                                    alt=""
                                    className="w-full h-48 object-cover cursor-pointer bg-background/60"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(a.url, "_blank");
                                    }}
                                />
                            ) : a.kind === "video" ? (
                                <video
                                    src={a.url}
                                    controls
                                    className="w-full h-48 object-cover bg-background/60"
                                    onClick={(e) => e.stopPropagation()}
                                />
                            ) : (
                                <a
                                    href={a.url}
                                    onClick={(e) => e.stopPropagation()}
                                    className="block border-dashed border p-3 bg-background/60"
                                >
                                    <p className="text-primary font-semibold truncate">{a.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatSize(a.size)}</p>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {!post.readOnly && (
                <div className="flex justify-between pt-2">
                    <div className="flex gap-3">
                        <Action
                            onClick={() => router.push(`/post/${post.id}`)}
                            icon={<MessagesSquare strokeWidth={3} size={18} />}
                            count={post.replies?.length ?? 0}
                            activeClassName="border-primary text-card bg-primary"
                            active={hasCommented}
                        />
                        {/* <Action
                            icon={<Repeat strokeWidth={3} size={18} />}
                            count={0}
                            activeClassName="border-primary text-card bg-primary"
                        /> */}
                        <Action
                            icon={<Heart strokeWidth={3} size={18} />}
                            count={likeCount}
                            activeClassName="border-primary text-card bg-primary"
                            onClick={toggleLike}
                            active={hasLiked}
                        />
                    </div>

                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                onClick={(e) => e.stopPropagation()}
                                className="cursor-pointer group flex items-center gap-1 px-2 py-1 rounded-lg border-2 border-primary hover:bg-primary transition"
                            >
                                <Share2 className="text-primary group-hover:text-[var(--lynt)]" strokeWidth={3} size={18} />
                            </button>
                        </DialogTrigger>
                        <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle>Share Post</DialogTitle>
                            </DialogHeader>
                            <div className="flex items-center space-x-2">
                                <div className="grid flex-1 gap-2">
                                    <Input
                                        id="link"
                                        defaultValue={`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`}
                                        readOnly
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    className="px-3 cursor-pointer"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`${typeof window !== 'undefined' ? window.location.origin : ''}/post/${post.id}`);
                                    }}
                                >
                                    <span className="sr-only">Copy</span>
                                    <Copy className="h-4 w-4" />
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            )}

            <ReportAbuse
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSubmit={report}
            />
        </div>
    );
}
