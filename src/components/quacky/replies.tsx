// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/client/auth";
import { PostCard } from "@/components/quacky/posts";
import { type Post } from "@/types";

interface Props {
    replies: Post[];
}

export default function Replies({ replies }: Props) {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    if (replies.length === 0) {
        return (
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-8 text-center">
                <p className="text-muted-foreground">No replies yet. Be the first to reply!</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {replies.map((reply) => (
                <PostCard key={reply.id} post={reply} session={session} router={router} />
            ))}
        </div>
    );
}
