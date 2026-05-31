// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, ArrowUpRight } from "lucide-react";
import { authClient } from "@/client/auth";
import { PostCard } from "@/components/quacky/posts";
import Reply from "@/components/quacky/reply";
import { type Post } from "@/types";

interface Props {
    postId: string;
    onClose: () => void;
}

function PanelSkeleton() {
    return (
        <div className="flex flex-col gap-3 animate-pulse p-4">
            <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-muted shrink-0" />
                <div className="flex flex-col gap-1.5 flex-1">
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="h-2.5 w-16 rounded bg-muted" />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-4/5 rounded bg-muted" />
                <div className="h-3 w-3/5 rounded bg-muted" />
            </div>
            <div className="flex gap-2 mt-1">
                <div className="h-7 w-12 rounded-lg bg-muted" />
                <div className="h-7 w-12 rounded-lg bg-muted" />
                <div className="h-7 w-12 rounded-lg bg-muted" />
            </div>
        </div>
    );
}

export default function PostPanel({ postId, onClose }: Props) {
    const router = useRouter();
    const { data: session } = authClient.useSession();
    const [post, setPost] = useState<Post | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    async function fetchPost() {
        setLoading(true);
        setError(false);
        try {
            const res = await fetch(`/api/v1/posts/${postId}`, { cache: "no-store" });
            if (!res.ok) { setError(true); return; }
            const data = await res.json();
            setPost(data.post ?? null);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setPost(null);
        fetchPost();
        // Scroll panel back to top when post changes
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }, [postId]);

    const replies = (post?.children ?? []).filter((c) => c.type === "reply");

    return (
        <aside className="w-96 h-full flex flex-col bg-background overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
                <span className="font-bold text-primary text-base">Post</span>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => router.push(`/post/${postId}`)}
                        className="p-1.5 rounded-full hover:bg-primary/10 transition text-muted-foreground"
                        title="Open full page"
                    >
                        <ArrowUpRight size={16} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full hover:bg-primary/10 transition text-muted-foreground"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Scrollable body */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto">
                {loading ? (
                    <PanelSkeleton />
                ) : error || !post ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                        Could not load post.
                    </div>
                ) : (
                    <div className="flex flex-col">
                        {/* Main post */}
                        <div>
                            <PostCard
                                post={post}
                                session={session}
                                router={router}
                                showActions={true}
                            />
                        </div>

                        {/* Reply composer */}
                        {!post.readOnly && (
                            <div className="px-3 py-3 ">
                                <Reply postId={postId} onReplySuccess={fetchPost} />
                            </div>
                        )}

                        {/* Replies */}
                        <div className="flex flex-col">
                            {replies.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-6 px-4">
                                    No replies yet. Be the first!
                                </p>
                            ) : (
                                replies.map((reply) => (
                                    <div key={reply.id} className="mb-2">
                                        <PostCard
                                            post={reply}
                                            session={session}
                                            router={router}
                                            showActions={true}
                                        />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        </aside>
    );
}
