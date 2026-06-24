"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BadgeCheck, Heart, Repeat2, MessagesSquare, BarChart2, Bookmark, Share, EyeOff } from "lucide-react";
import Link from "next/link";
import { Markdown } from "@/components/md";

export interface Post {
    id: string;
    author: {
        name: string;
        handle: string;
        image: string;
        verified: boolean;
    };
    content: string;
    flagged: boolean;
    edited: boolean;
    createdAt: string;
    repost: {
        repost: boolean;
        by: {
            name: string;
            handle: string;
        }
    }
    attachments?: {
        name: string;
        url: string;
    }[]
}

export function Post(
    {
        post
    }: {
        post: Post;
    }
) {
    return (
        <Link href={`/post/${post.id}`} >
            <div className="rounded-md border-2 border-border bg-background p-4 flex flex-col gap-2  hover:border-primary/80 transition">
                {post.repost.repost && (
                    <div className="flex items-center gap-1 mb-2 text-sm">
                        <Repeat2 size={15} strokeWidth={3} />
                        <span className="font-semibold text-xs">reposted by {post.repost.by.name} (@{post.repost.by.handle})</span>
                    </div>
                )}

                <div className="flex items-center gap-2 mb-2">
                    <Image
                        src={post.author.image}
                        alt={post.author.name}
                        width={28}
                        height={28}
                        unoptimized
                        className="rounded-full"
                    />

                    <div className="flex items-center gap-1 text-base font-semibold">
                        <span className="text-primaryd">{post.author.name}</span>

                        {post.author.verified && (
                            <BadgeCheck
                                className="h-[20px] w-[20px] fill-primary text-background"
                            />
                        )}

                        <span className="text-sm text-muted-foreground">
                            @{post.author.handle}
                        </span>

                        <span className="text-sm text-muted-foreground">
                            · 1h {post.edited && (
                                <span className="text-xs text-muted-foreground font-medium">(edited)</span>
                            )}
                        </span>
                    </div>
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

                {post.attachments?.length ? (
                    <div
                        className={`grid gap-2 ${post.attachments.length === 1
                            ? "grid-cols-1"
                            : "grid-cols-2"
                            }`}
                    >
                        {post.attachments.map((attachment, index) => (
                            <img
                                key={index}
                                src={attachment.url}
                                alt={attachment.name}
                                className="h-full max-h-[300px] w-full rounded-md object-cover"
                                loading="lazy"
                            />
                        ))}
                    </div>
                ) : null}

                <div className="text-xs text-muted-foreground">
                    Posted {new Date(post.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                    })}
                </div>

                <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1.5">
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                        >
                            <MessagesSquare
                                strokeWidth={3}
                            />

                            0
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                        >
                            <Repeat2
                                strokeWidth={3}
                                size={16}
                            />

                            0
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                        >
                            <Heart
                                strokeWidth={3}
                                size={16}
                            />

                            0
                        </Button>
                    </div>
                    <div className="ml-auto gap-1.5 flex">
                        <Button
                            variant="default"
                            size="sm"
                            className="h-8 py-1 px-2.5 text-md font-semibold text-primary/80 hover:text-primary bg-background border-2 border-border hover:bg-background hover:border-primary"
                        >
                            <BarChart2
                                strokeWidth={3}
                                size={16}
                            />

                            0
                        </Button>
                        <Button
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
        </Link >
    )
}