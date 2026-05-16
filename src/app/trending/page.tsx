// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/client/auth";

import Sidebar from "@/components/quacky/sidebar";
import Rightbar from "@/components/quacky/v2/rightbar";
import Posts, { PostsSkeleton } from "@/components/quacky/posts";
import Loading from "@/components/loading";
import Login from "@/components/login";

import { Flame, Hash, TrendingUp } from "lucide-react";
import type { Post } from "@/types";

interface TrendingTag {
    tag: string;
    count: number;
}

function formatCount(n: number) {
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
}

function HashtagRow({ tag, count, rank }: { tag: string; count: number; rank: number }) {
    return (
        <Link
            href={`/hashtag/${tag}`}
            className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-primary/5 transition group"
        >
            <span className="text-xs font-bold text-muted-foreground w-5 text-right shrink-0">
                {rank}
            </span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                <Hash size={14} className="text-primary shrink-0" strokeWidth={2.5} />
                <span className="font-bold text-primary text-sm group-hover:underline truncate">
                    {tag}
                </span>
            </div>
            <span className="text-xs text-muted-foreground font-medium shrink-0">
                {formatCount(count)} post{count !== 1 ? "s" : ""}
            </span>
        </Link>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center gap-2 mb-3">
            <span className="text-primary">{icon}</span>
            <h2 className="text-lg font-bold text-primary">{title}</h2>
        </div>
    );
}

export default function TrendingPage() {
    const { data: session, isPending } = authClient.useSession();
    const [hashtags, setHashtags] = useState<TrendingTag[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [hashtagsLoading, setHashtagsLoading] = useState(true);
    const [postsLoading, setPostsLoading] = useState(true);

    useEffect(() => {
        if (!session) return;
        async function load() {
            const [hRes, pRes] = await Promise.all([
                fetch("/api/v1/hashtags/trending?limit=20"),
                fetch("/api/v1/posts/trending"),
            ]);
            const [hData, pData] = await Promise.all([hRes.json(), pRes.json()]);
            setHashtags(hData.trending ?? []);
            setHashtagsLoading(false);
            setPosts(pData.posts ?? []);
            setPostsLoading(false);
        }
        load();
    }, [session]);

    if (isPending) return <Loading />;
    if (!session) return <Login />;

    return (
        <main className="min-h-screen w-full flex flex-col items-center bg-background dark:bg-background">
            <div className="relative z-10 flex w-full max-w-[1100px] flex-1 gap-3 px-4">

                <Sidebar session={session} />

                <div className="flex-1 flex flex-col gap-4 pt-8 pb-24 lg:pb-8 w-full min-w-0 lg:max-w-2xl">


                    {/* Trending posts */}
                    <div>

                        {postsLoading ? (
                            <PostsSkeleton count={4} />
                        ) : posts.length === 0 ? (
                            <div className="rounded-xl border border-border bg-card p-12 text-center">
                                <Flame size={40} className="mx-auto mb-3 text-primary opacity-30" />
                                <p className="font-bold text-primary">Nothing trending yet</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                    Posts that get the most love this week will show up here.
                                </p>
                            </div>
                        ) : (
                            <Posts posts={posts} />
                        )}
                    </div>

                </div>

                <Rightbar session={session} />
            </div>
        </main>
    );
}
