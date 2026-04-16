// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useState, useEffect, use } from "react";
import { authClient } from "@/client/auth";
import { redirect } from "next/navigation";

import Sidebar from "@/components/quacky/sidebar";
import RightSidebar from "@/components/quacky/discover";
import Posts from "@/components/quacky/posts";
import Loading from "@/components/loading";
import { Hash } from "lucide-react";
import type { Post } from "@/types";

export default function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
    const { tag } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/v1/hashtags/${encodeURIComponent(tag)}`)
            .then((r) => r.json())
            .then((d) => setPosts(d.posts ?? []))
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [tag]);

    if (isPending) return <Loading />;
    if (!session) redirect("/login");

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4">
                <Sidebar session={session} />

                <div className="flex-1 flex flex-col gap-4 pt-8 max-w-2xl">
                    <div className="flex items-center gap-2 px-1 mb-2">
                        <Hash size={22} strokeWidth={2.5} className="text-primary" />
                        <h1 className="text-2xl font-bold text-primary">{tag}</h1>
                    </div>

                    {loading ? (
                        <Loading />
                    ) : posts.length === 0 ? (
                        <div className="rounded-xl border border-border bg-[var(--lynt)] p-12 text-center">
                            <Hash size={48} className="mx-auto mb-4 text-primary" />
                            <p className="text-lg font-bold text-primary">No posts yet</p>
                            <p className="text-sm text-muted-foreground mt-2">
                                Be the first to use #{tag}
                            </p>
                        </div>
                    ) : (
                        <Posts posts={posts} />
                    )}
                </div>

                <RightSidebar session={session} />
            </div>
        </main>
    );
}
