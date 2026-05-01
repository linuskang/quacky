// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { authClient } from "@/client/auth";
import { useEffect, useState } from "react";
import Image from "next/image";

// UI Components
import Login from "@/components/login";
import Sidebar from "@/components/quacky/sidebar";
import Discover from "@/components/quacky/discover";
import Loading from "@/components/loading";
import Posts, { PostsSkeleton } from "@/components/quacky/posts";
import Compose from "@/components/quacky/compose";
import Footer from "@/components/quacky/footer";

// Utilities
import { getPosts } from "@/client/utils";
import { useTheme } from "next-themes";

// Types
import { Post } from "@/types";

export default function Homepage() {
    // States
    const { data: session, isPending } = authClient.useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const { resolvedTheme } = useTheme();

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
        setPostsLoading(true);
        setPosts(await getPosts());
        setPostsLoading(false);
    }

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center bg-background dark:bg-background">
            <div className="relative z-10 flex w-full max-w-[1200px] flex-1 gap-4 px-4 pb-24 lg:pb-8">
                <Sidebar
                    session={session}
                />

                <div className="flex-1 flex flex-col gap-4 pt-8 w-full min-w-0 lg:max-w-2xl">
                    <Compose
                        onPost={loadPosts}
                    />

                    {postsLoading ? (
                        <PostsSkeleton />
                    ) : (
                        <Posts
                            posts={posts}
                            onChanged={loadPosts}
                        />
                    )}
                </div>

                <Discover
                    session={session}
                />
            </div>

            <div className="relative z-10 w-full">
                <Footer />
            </div>

            <div
                aria-hidden="true"
                className="pointer-events-none fixed inset-x-0 bottom-0 z-0"
            >
                <Image
                    src={resolvedTheme === "dark" ? "/assets/bg/dark.png" : "/assets/bg/light.png"}
                    alt=""
                    width={0}
                    height={0}
                    sizes="100vw"
                    priority
                    className="w-full h-auto"
                />
            </div>
        </main>
    );
}
