"use client";

// Libraries
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { PostList } from "@/components/post";
import { SearchBar } from "@/components/search-bar";

// Types
import { Post } from "@/types";

export default function Page() {
    const [bookmarks, setBookmarks] = useState<Post[]>([]);

    useEffect(() => {
        const fetchBookmarks = async () => {
            const res = await fetch("/api/bookmarks");
            if (!res.ok) {
                toast.error(res.statusText);
            }
            const bookmarks = await res.json();
            setBookmarks(bookmarks);
        };

        fetchBookmarks();
    }, []);

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Your Bookmarks</h1>
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