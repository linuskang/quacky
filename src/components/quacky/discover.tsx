"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TrendingUp, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
    session: {
        user: {
            name: string;
            handle: string;
            image?: string | null;
        }
    }
}

interface TrendingTag {
    tag: string;
    count: number;
}

export default function Discover({ session }: Props) {
    const [trending, setTrending] = useState<TrendingTag[]>([]);

    useEffect(() => {
        if (!session) return;
        fetch("/api/v1/hashtags/trending")
            .then((r) => r.json())
            .then((d) => setTrending(d.trending ?? []))
            .catch(() => {});
    }, [session]);

    if (!session) {
        return (
            <aside className="sticky top-0 w-80 shrink-0 hidden lg:flex flex-col gap-4 pt-8 lg:h-screen overflow-y-auto pb-8">
                <div className="rounded-xl bg-card border border-border p-4">
                    <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                        Welcome to Quacky
                    </h2>
                    <div className="flex flex-col mb-4">
                        Connect with friends, follow your favourite creators, and discover what's happening in the world.
                    </div>

                    <Button
                        onClick={() => (window.location.href = '/login')}
                        className="w-full h-11 cursor-pointer flex items-center justify-center"
                    >
                        Sign in
                    </Button>
                </div>
            </aside>
        )
    }

    return (
        <aside className="sticky top-0 w-80 shrink-0 hidden lg:flex flex-col gap-4 pt-8 lg:h-screen overflow-y-auto pb-8">
            <div className="rounded-xl bg-card border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <TrendingUp size={24} strokeWidth={3} />
                    Trending
                </h2>
                <div className="flex flex-col gap-1">
                    {trending.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No trending hashtags yet.</p>
                    ) : (
                        trending.map(({ tag, count }) => (
                            <Link
                                key={tag}
                                href={`/hashtag/${tag}`}
                                className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-primary/5 transition group"
                            >
                                <div className="flex items-center gap-2">
                                    <Hash size={15} className="text-muted-foreground shrink-0" />
                                    <span className="font-bold text-primary text-sm group-hover:underline">{tag}</span>
                                </div>
                                <span className="text-xs text-muted-foreground font-medium">{count} post{count !== 1 ? "s" : ""}</span>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </aside>
    );
}
