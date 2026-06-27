"use client";
import { Comment } from "@/types";
import { BadgeCheck, SendHorizontal, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Admin } from "./icons";
import { formatTimeAgo } from "@/client/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "./ui/button";

import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { CharCounter } from "./char-counter";
import { useState } from "react";

export function CommentList(
    {
        comments,
        postId
    }: {
        comments: Comment[];
        postId: string;
    }
) {
    return (
        <div className="flex flex-col gap-2">
            <Reply
                postId={postId}
            />
            <h1 className="text-lg font-semibold mt-2">Comments</h1>
            {comments.length == 0 ? (
                <>
                    <Image
                        src="/balloon.png"
                        alt="No comments"
                        width={400}
                        height={400}
                        className="mx-auto mt-4"
                    />
                    <p className="text-sm text-center text-muted-foreground">
                        No comments yet. Be the first to comment!
                    </p>
                </>
            ) : (
                comments.map((comment) => (
                    <CommentCard
                        key={comment.id}
                        comment={comment}
                    />
                ))
            )}
        </div>
    )
}

export function Reply(
    {
        postId,
    }: {
        postId: string;
    }
) {
    const [content, setContent] = useState("");

    async function comment() {
        const res = await fetch(`/api/posts/${postId}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    content
                }
            )
        });

        if (!res.ok) {
            toast.error(res.statusText);
            return;
        }

        setContent("");
        toast.success("Comment created!");
    }

    return (
        <InputGroup className="!bg-card border-2 border-border h-10 !ring-0 focus-within:!border-chart-3">
            <InputGroupInput
                className="!text-sm !font-semibold"
                placeholder="Write a reply... (nice comments only :D)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
                <CharCounter
                    length={content.length}
                    maxLength={100}
                    width={8}
                    height={8}
                />
                <InputGroupButton
                    variant="ghost"
                    className="hover:!bg-transparent"
                    onClick={comment}
                    disabled={content.trim().length == 0 || content.length > 100}
                >
                    <SendHorizontal className="!size-5 text-foreground" />
                </InputGroupButton>
            </InputGroupAddon>
        </InputGroup>
    )
}

export function CommentCard(
    {
        comment,
    }: {
        comment: Comment;
    }
) {

    const timeAgo = formatTimeAgo(comment.createdAt);
    return (
        <div
            className="rounded-md border-2 border-border max-w-lg !bg-card-primary p-4 flex flex-col gap-2"
        >
            <div className="flex gap-3">
                <div className="shrink-0">
                    <Image
                        src={comment.author.image}
                        alt={comment.author.name}
                        width={28}
                        height={28}
                        unoptimized
                        className="rounded-full"
                    />
                </div>
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-base font-semibold flex-wrap">
                        <span className="text-primary">{comment.author.name}</span>

                        {comment.author.verified && (
                            <BadgeCheck
                                className="h-[20px] w-[20px] fill-primary text-background"
                            />
                        )}

                        {comment.author.role == "admin" && (
                            <Admin />
                        )}

                        <span className="text-sm text-muted-foreground">
                            @{comment.author.username}
                        </span>

                        <span className="text-sm text-muted-foreground">
                            · {timeAgo}
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
                    <div className="text-sm text-muted-foreground break-words mb-1">
                        {comment.content}
                    </div>
                </div>
            </div>
        </div>
    )
}