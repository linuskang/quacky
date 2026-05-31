// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { notFound } from "next/navigation";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/client/auth";

import RightSidebar from "@/components/quacky/discover";
import Sidebar from "@/components/quacky/sidebar";
import { PostCard } from "@/components/quacky/posts";
import Replies from "@/components/quacky/replies";
import Reply from "@/components/quacky/reply";
import Loading from "@/components/loading";
import Login from "@/components/login";

import { type Post } from "@/types";

interface Props {
    params: Promise<{ id: string }>;
}

export default function PostPage({ params }: Props) {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [post, setPost] = useState<Post | null>(null);
    const [ancestors, setAncestors] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const { id } = use(params);

    async function fetchPost() {
        try {
            const res = await fetch(`/api/v1/posts/${id}`, { cache: "no-store" });
            if (!res.ok) { setPost(null); return; }
            const data = await res.json();
            setPost(data.post ?? null);
            setAncestors(data.ancestors ?? []);
        } catch {
            setPost(null);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        setLoading(true);
        fetchPost();
    }, [id]);

    if (loading || isPending) return <Loading />;
    if (!session) return <Login />;
    if (!post) notFound();

    const replies = (post.children ?? []).filter((c) => c.type === "reply");

    return (
        <main className="min-h-screen w-full flex flex-col items-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1100px] flex-1 gap-4 px-4">
                <Sidebar session={session} />

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">

                    {/* Ancestor thread — show parent posts above, oldest first */}
                    {ancestors.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {ancestors.map((ancestor) => (
                                <div key={ancestor.id} className="relative">
                                    <PostCard post={ancestor} session={session} router={router} />
                                    {/* Thread connector line */}
                                    <div className="absolute left-[27px] bottom-[-10px] w-[2px] h-[10px] bg-border" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Main post */}
                    <PostCard post={post} session={session} router={router} />

                    {/* Reply composer */}
                    {!post.readOnly && (
                        <>
                            <Reply postId={id} onReplySuccess={fetchPost} />

                            <div className="flex flex-col gap-2">
                                <h2 className="text-xl font-bold text-primary px-1">Replies</h2>
                                <Replies replies={replies} />
                            </div>
                        </>
                    )}
                </div>

                <RightSidebar session={session} />
            </div>

            <footer className="w-full py-4 text-center text-xs text-muted-foreground">
                (c) Linus Kang 2026. All Rights Reserved.
            </footer>
        </main>
    );
}
