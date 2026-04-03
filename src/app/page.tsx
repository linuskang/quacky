// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { authClient } from "@/client/auth";
import { useEffect, useState } from "react";

// UI Components
import Login from "@/components/login";
import Sidebar from "@/components/quacky/sidebar";
import Discover from "@/components/quacky/discover";
import Loading from "@/components/loading";
import Posts from "@/components/quacky/posts";
import Compose from "@/components/quacky/compose";

// Utilities
import { getPosts } from "@/client/utils";

// Types
import { Post } from "@/types";

export default function Homepage() {
    // States
    const { data: session, isPending } = authClient.useSession();
    const [posts, setPosts] = useState<Post[]>([]);

    useEffect(() => {
        loadPosts();
    }, [session]);

    // Loading
    if (isPending) {
        return (
            <Loading />
        )
    }

    // Not logged in
    if (!session) {
        return (
            <Login />
        )
    }

    // Load helper
    async function loadPosts() {
        setPosts(await getPosts());
    }

    return (
        <main className="min-h-screen w-full flex justify-center bg-background dark:bg-background">
            <div className="flex w-full max-w-[1200px] gap-4 px-4 pb-24 lg:pb-8">
                <Sidebar
                    name={session.user.name}
                    handle={session.user.handle}
                    image={session.user.image}
                />

                <div className="flex-1 flex flex-col gap-4 pt-8 w-full min-w-0 lg:max-w-2xl">
                    <Compose
                        onPost={loadPosts}
                    />

                    <Posts
                        posts={posts}
                    />
                </div>

                <Discover
                    session={session}
                />
            </div>
        </main>
    );
}
