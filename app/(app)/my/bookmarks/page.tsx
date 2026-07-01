"use client";

// Libraries
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { PostList } from "@/components/post";
import { SearchBar } from "@/components/search-bar";
import Loading from "@/components/loading";

// Types
import { Post } from "@/types";

export default function Page() {
    const [bookmarks, setBookmarks] = useState<Post[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchBookmarks = async () => {
            setLoading(true);
            const res = await fetch("/api/bookmarks");
            if (!res.ok) {
                toast.error(res.statusText);
            }
            const bookmarks = await res.json();
            setBookmarks(bookmarks);
            setLoading(false);
        };

        fetchBookmarks();
    }, []);

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Your Bookmarks</h1>
                {loading && <Loading />}
                <PostList
                    posts={bookmarks}
                />
            </PageCenter>
            <PageRight>
                <SearchBar

                />
            </PageRight>
        </PageLayout>
    )
}