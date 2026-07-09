"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";

import { PostList } from "@/components/post";
import { Composer } from "@/components/composer";
import { Tabs } from "@/components/post-tabs";
import { HomepageWidgets } from "./widgets";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import type { Post } from "@/types";
import Loading from "../loading";
import { SuggestedPeopleFeedCard } from "@/components/suggested-people";

const tabs = [
    { name: "Recent", id: "recent" },
    { name: "For you", id: "foryou" },
    { name: "Following", id: "following" },
    { name: "Popular", id: "popular" },
];

export default function Page() {
    const [activeTab, setActiveTab] = useState("recent");
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            try {
                const endpoints: Record<string, string> = {
                    recent: "/api/posts",
                    foryou: "/api/posts/foryou",
                    following: "/api/posts/following",
                    popular: "/api/posts/popular",
                };

                const res = await axios.get(endpoints[activeTab]);
                setPosts(res.data);
            } catch {
                toast.error("i think my server blew up because I CANT LOAD POSTS RIGHT NOW 😭😭😭");
                setPosts([])
            } finally {
                setLoading(false);
            }
        }

        loadPosts();
    }, [activeTab]);

    return (
        <PageLayout>
            <PageCenter>
                <Composer />
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onSelect={setActiveTab}
                />
                {loading ? (
                    <Loading />
                ) : (
                    <PostList posts={posts} afterFirst={<SuggestedPeopleFeedCard />} />
                )}
            </PageCenter>
            <PageRight>
                <HomepageWidgets />
            </PageRight>
        </PageLayout>
    );
}
