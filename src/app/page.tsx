//    ____                   _          
//   / __ \                 | |         
//  | |  | |_   _  __ _  ___| | ___   _ 
//  | |  | | | | |/ _` |/ __| |/ / | | |
//  | |__| | |_| | (_| | (__|   <| |_| |
//   \___\_\\__,_|\__,_|\___|_|\_\\__, |
//                                 __/ |
//                                |___/ 

"use client";

// Libraries
import {authClient} from "@/client/auth";
import {useEffect, useState} from "react";

// UI Components
import Login from "@/components/login";
import Sidebar from "@/components/quacky/sidebar";
import Discover from "@/components/quacky/v2/rightbar";
import Loading from "@/components/loading";
import Posts, {PostsSkeleton} from "@/components/quacky/posts";
import Compose from "@/components/quacky/compose";
import {InteractiveButton} from "@/components/quacky/interactive-button";

// Utilities
import {getPosts} from "@/client/utils";

// Types
import {Post} from "@/types";

export default function Homepage() {
    // States
    const {data: session, isPending} = authClient.useSession();
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(true);

    // Load helper
    async function loadPosts() {
        setPostsLoading(true);
        setPosts(await getPosts());
        setPostsLoading(false);
    }

    useEffect(() => {
        if (!session) return;
        async function fetchInitialPosts() {
            setPostsLoading(true);
            setPosts(await getPosts());
            setPostsLoading(false);
        }
        fetchInitialPosts();
    }, [session]);

    // Loading
    if (isPending) {
        return (
            <Loading/>
        )
    }

    // Not logged in
    if (!session) {
        return (
            <Login/>
        )
    }

    return (
        <main className="relative min-h-screen w-full flex flex-col items-center bg-background dark:bg-background">
            <div className="relative z-10 flex w-full max-w-[1100px] flex-1 gap-3 px-4">

                <Sidebar
                    session={session}
                />

                <div className="flex-1 flex flex-col gap-2 pt-8 pb-24 lg:pb-8 w-full min-w-0 lg:max-w-2xl">
                    <Compose
                        onPost={loadPosts}
                    />

                    {postsLoading ? (
                        <PostsSkeleton/>
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

            {/* <div
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
            </div> */}

            <InteractiveButton
                message="click me to play a game ^^"
                hoverImage="/assets/bin/open.png"
                defaultImage="/assets/bin/close.png"
                onClick={() => {

                }}
                ariaLabel="Toggle corner asset"
            />

            {/* <div
                aria-hidden="true"
                className="pointer-events-none fixed right-40 top-[24%] z-0 -translate-y-1/2"
            >
                <Image
                    src="/assets/qky/balloon.png"
                    alt=""
                    width={700}
                    height={700}
                    sizes="700px"
                    priority
                    className="h-auto w-80"
                />
            </div> */}
        </main>
    );
}
