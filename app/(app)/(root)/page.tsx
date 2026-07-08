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
import Loading from "@/components/loading";

const TABS = [
    { name: "Recent Activity", id: "recent" },
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
                const res = await axios.get(`/api/posts?feed=${activeTab}`);
                setPosts(res.data);
            } catch {
                toast.error("Failed to load posts.");
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
                    tabs={TABS}
                    activeTab={activeTab}
                    onSelect={setActiveTab}
                />
                {loading ? (
                    <Loading />
                ) : (
                    <PostList posts={posts} />
                )}
            </PageCenter>
            <PageRight>
                <HomepageWidgets />
            </PageRight>
        </PageLayout>
    );
}
