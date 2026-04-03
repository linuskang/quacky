// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import Link from "next/link";

// UI Components
import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Utilities
import { formatTimestamp } from "@/client/utils"

// Types
import { type Replies } from "@/types";
interface Props {
    replies: Replies[];
}

export default function Replies({ replies }: Props) {

    if (replies.length === 0) {
        return (
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-8 text-center">
                <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {replies.map((reply) => {
                return (
                    <div
                        key={reply.id}
                        className="rounded-xl bg-[var(--lynt)] dark:bg-[var(--lynt)] border border-border p-4 flex flex-col gap-2"
                    >
                        <div className="flex items-center gap-2 mb-2">

                            <Avatar className="w-7 h-7">
                                <AvatarImage src={reply.author?.image || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {reply.author.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <Link href={`/${reply.author?.handle}`} className="font-bold ml-0 text-primary hover:underline">
                                {reply.author.name}
                            </Link>

                            {reply.author.verified && (
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
                                @{reply.author.handle} • {formatTimestamp(reply.createdAt)}
                            </span>

                        </div>

                        <div className="flex flex-col gap-1 text-base rounded-md p-1 -m-1">
                            <span className="whitespace-pre-wrap">{reply.content}</span>
                        </div>

                    </div>
                );
            })}
        </div>
    );
}
