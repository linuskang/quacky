"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AboutWidget } from "@/components/about";
import { PageCenter, PageLayout, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { TrendingWidget } from "@/components/trending";

type TrendingHashtag = {
    tag: string;
    count: number;
};

export default function TrendingPage() {
    const [hashtags, setHashtags] = useState<TrendingHashtag[]>([]);

    useEffect(() => {
        const fetchTrending = async () => {
            const res = await fetch("/api/trending");

            if (!res.ok) {
                return;
            }

            setHashtags(await res.json());
        };

        fetchTrending();
    }, []);

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-bold">trending now</h1>

                <div className="rounded-lg border-2 border-border bg-card">
                    {hashtags.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                            no hashtags trending yet.
                        </p>
                    ) : (
                        hashtags.map((hashtag, index) => (
                            <Link
                                key={hashtag.tag}
                                href={`/trending/${hashtag.tag}`}
                                className="flex items-center justify-between px-4 py-3 "
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-5 text-right text-sm font-medium text-muted-foreground">
                                        {index + 1}
                                    </span>

                                    <span className="font-semibold text-primary-2">
                                        #{hashtag.tag}
                                    </span>
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    {hashtag.count.toLocaleString()}
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            </PageCenter>
            <PageRight>
                <SearchBar />
                <TrendingWidget />
                <AboutWidget />
            </PageRight>
        </PageLayout>
    );
}
