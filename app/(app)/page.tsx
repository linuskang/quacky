"use client";

// Libraries
import { useState, useEffect } from "react";
import { fetchRecentPosts } from "./helpers";

// Components
import { PostList } from "@/components/post";
import { Composer } from "@/components/composer";
import { Tabs } from "@/components/post-tabs";
import { SearchBar } from "@/components/search-bar";
import { StreakWidget } from "@/components/streak";
import { AboutWidget } from "@/components/about";
import { RngWidget } from "@/components/rng";
import { TrendingWidget } from "@/components/trending";
import { Feedback } from "@/components/bin";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import Loading from "@/components/loading";

// Types
import { Post } from "@/types";

export default function Page() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const recentPosts = async () => {
            setLoading(true);
            const posts = await fetchRecentPosts();
            setPosts(posts);
            setLoading(false);
        }
        recentPosts();
    }, []);

    return (
        <PageLayout>
            <PageCenter>
                <Composer />
                <Tabs
                    tabs={[
                        { name: "Recent", href: "#", current: true },
                        { name: "For you", href: "#", current: false },
                        { name: "Following", href: "#", current: false },
                        { name: "Popular", href: "#", current: false },
                    ]}
                />
                {loading && <Loading />}
                <PostList
                    posts={posts}
                />
            </PageCenter>
            <PageRight>
                <SearchBar />
                <StreakWidget />
                <AboutWidget />
                <RngWidget />
                <TrendingWidget />
                <Feedback />
            </PageRight>
        </PageLayout>
    )
}