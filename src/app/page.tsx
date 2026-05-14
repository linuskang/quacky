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
import { authClient } from "@/client/auth";
import { useEffect, useRef, useState } from "react";
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
    const [isBinHovered, setIsBinHovered] = useState(false);
    const [bubbleText, setBubbleText] = useState("");
    const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);
    const BUBBLE_MESSAGE = "click me to play a game ^^";
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        if (typingTimer.current) clearInterval(typingTimer.current);
        if (isBinHovered) {
            setBubbleText("");
            let i = 0;
            typingTimer.current = setInterval(() => {
                i++;
                setBubbleText(BUBBLE_MESSAGE.slice(0, i));
                if (i >= BUBBLE_MESSAGE.length) clearInterval(typingTimer.current!);
            }, 45);
        } else {
            setBubbleText("");
        }
        return () => { if (typingTimer.current) clearInterval(typingTimer.current); };
    }, [isBinHovered]);

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

    function handleBinClick() {
        // Add client-side behavior here.
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

            {/* Speech bubble */}
            <div
                className={`fixed bottom-[180px] right-[42px] z-10 pointer-events-none select-none transition-all duration-150 ${
                    isBinHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
            >
                <div className="relative rotate-[-1.5deg]">
                    <svg width="242" height="72" viewBox="0 0 242 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Bubble + tail as one filled shape */}
                        <path
                            d="M14 4 C14 4 80 0 140 1 C180 1 228 2 229 14 C230 26 229 42 228 52 C227 61 220 65 206 66 C175 67 80 67 36 66 C18 65 10 59 10 50 C9 38 10 20 11 12 C12 7 13 4 14 4 Z M185 66 C188 69 196 74 192 76 C184 72 172 68 168 67 Z"
                            fill="white"
                            stroke="#1c1c1c"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {/* Hard offset shadow */}
                        <path
                            d="M14 4 C14 4 80 0 140 1 C180 1 228 2 229 14 C230 26 229 42 228 52 C227 61 220 65 206 66 C175 67 80 67 36 66 C18 65 10 59 10 50 C9 38 10 20 11 12 C12 7 13 4 14 4 Z M185 66 C188 69 196 74 192 76 C184 72 172 68 168 67 Z"
                            fill="none"
                            stroke="#1c1c1c"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            transform="translate(3,3)"
                            opacity="0.15"
                        />
                    </svg>
                    <p
                        className="absolute top-0 left-0 right-0 bottom-[12px] flex items-center justify-center text-sm font-bold text-zinc-900 whitespace-nowrap px-5"
                        style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}
                    >
                        {bubbleText}
                        {bubbleText.length < BUBBLE_MESSAGE.length && (
                            <span className="animate-pulse ml-px">|</span>
                        )}
                    </p>
                </div>
            </div>

            <button
                type="button"
                aria-label="Toggle corner asset"
                className="fixed -bottom-10 -right-15 z-0 cursor-pointer pointer-events-auto transition-transform duration-200 hover:scale-110 active:scale-95"
                onClick={handleBinClick}
                onMouseEnter={() => setIsBinHovered(true)}
                onMouseLeave={() => setIsBinHovered(false)}
            >
                <Image
                    src={isBinHovered ? "/assets/bin/open.png" : "/assets/bin/close.png"}
                    alt="Corner asset"
                    width={220}
                    height={220}
                    sizes="220px"
                    priority
                    className="h-auto w-56"
                />
            </button>

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
