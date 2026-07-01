"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { fetchPostsByHashtag } from "../../helpers";
import { AboutWidget } from "@/components/about";
import Loading from "@/components/loading";
import { PageCenter, PageLayout, PageRight } from "@/components/page-layout";
import { PostList } from "@/components/post";
import { SearchBar } from "@/components/search-bar";
import { TrendingWidget } from "@/components/trending";
import type { Post } from "@/types";

export default function TrendingTagPage() {
    const params = useParams<{ tag: string }>();
    const tag = decodeURIComponent(params.tag).toLowerCase();
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            const posts = await fetchPostsByHashtag(tag);
            setPosts(posts);
            setLoading(false);
        };

        fetchPosts();
    }, [tag]);

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-bold text-primary-2">#{tag}</h1>
                {loading && <Loading />}
                <PostList posts={posts} />
            </PageCenter>
            <PageRight>
                <SearchBar />
                <TrendingWidget />
                <AboutWidget />
            </PageRight>
        </PageLayout>
    );
}
