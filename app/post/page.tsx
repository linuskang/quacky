"use client";

import { PostList } from "@/components/post";
import { Composer } from "@/components/composer";
import { toast } from "sonner";
import { Tabs } from "@/components/post-tabs";
import { SearchBar } from "@/components/search-bar";
import { StreakWidget } from "@/components/streak";
import { AboutWidget } from "@/components/about";
import { RngWidget } from "@/components/rng";
import { TrendingWidget } from "@/components/trending";
import { InteractiveButton } from "@/components/bin";
import { Profile } from "@/components/profile";

export default function Page() {
    return (
        <main className="relative min-h-screen w-full bg-background">
            <div className="flex flex-col gap-3 mx-auto w-full max-w-xl px-4 mt-8 mb-8">
                <Composer
                    onSubmit={({ content, files }) => {
                        toast(`Submitted: ${content} (${files.length} file${files.length === 1 ? "" : "s"})`);
                    }}
                    session={{
                        user: {
                            name: "Linus Kang",
                            handle: "linusdotmy",
                            image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus"
                        }
                    }}
                />
                <Tabs
                    tabs={[
                        { name: "Recent", href: "#", current: true },
                        { name: "For you", href: "#", current: false },
                        { name: "Following", href: "#", current: false },
                        { name: "Popular", href: "#", current: false },
                    ]}
                />
                <PostList
                    posts={[
                        {
                            id: "1",
                            author: {
                                name: "Linus Kang",
                                handle: "linusdotmy",
                                image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                verified: false,
                                staff: true
                            },
                            content: "Hello, this is a sample *post component*. ``You`` can **customize it** as you like!\n\nMoreover, newline is supported!\nContact me at https://linus.my",
                            createdAt: "2026-06-24T22:55Z",
                            edited: false,
                            flagged: false,
                            views: 100,
                            quote: {
                                by: {
                                    name: "John Doe",
                                    handle: "johndoe",
                                },
                                post: {
                                    id: "2",
                                    author: {
                                        name: "Linus Kang",
                                        handle: "linusdotmy",
                                        image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                        verified: false,
                                        staff: true
                                    },
                                    content: "This is a quoted post. You can click on it to view the original post.",
                                    createdAt: "2026-06-24T22:55Z",
                                    edited: true,
                                    flagged: false,
                                }
                            },
                            likes: 50,
                            reposts: 10,
                            comments: 5,
                            repost: {
                                repost: false,
                                by: {
                                    name: "admin",
                                    handle: "administrator",
                                }
                            },
                        },
                        {
                            id: "2",
                            author: {
                                name: "Linus Kang",
                                handle: "linusdotmy",
                                image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                verified: false,
                                staff: true
                            },
                            content: "Hello, this is a sample *post component*. ``You`` can **customize it** as you like!\n\nMoreover, newline is supported!\nContact me at https://linus.my",
                            createdAt: "2026-06-24T22:55Z",
                            edited: false,
                            flagged: false,
                            views: 100,
                            quote: {
                                by: {
                                    name: "John Doe",
                                    handle: "johndoe",
                                },
                                post: {
                                    id: "2",
                                    author: {
                                        name: "Linus Kang",
                                        handle: "linusdotmy",
                                        image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                        verified: false,
                                        staff: true
                                    },
                                    content: "This is a quoted post. You can click on it to view the original post.",
                                    createdAt: "2026-06-24T22:55Z",
                                    edited: true,
                                    flagged: false,
                                }
                            },
                            likes: 50,
                            reposts: 10,
                            comments: 5,
                            repost: {
                                repost: false,
                                by: {
                                    name: "admin",
                                    handle: "administrator",
                                }
                            },
                        },
                        {
                            id: "3",
                            author: {
                                name: "Linus Kang",
                                handle: "linusdotmy",
                                image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                verified: false,
                                staff: true
                            },
                            content: "Hello, this is a sample *post component*. ``You`` can **customize it** as you like!\n\nMoreover, newline is supported!\nContact me at https://linus.my",
                            createdAt: "2026-06-24T22:55Z",
                            edited: false,
                            flagged: false,
                            views: 100,
                            quote: {
                                by: {
                                    name: "John Doe",
                                    handle: "johndoe",
                                },
                                post: {
                                    id: "2",
                                    author: {
                                        name: "Linus Kang",
                                        handle: "linusdotmy",
                                        image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                        verified: false,
                                        staff: true
                                    },
                                    content: "This is a quoted post. You can click on it to view the original post.",
                                    createdAt: "2026-06-24T22:55Z",
                                    edited: true,
                                    flagged: false,
                                }
                            },
                            likes: 50,
                            reposts: 10,
                            comments: 5,
                            repost: {
                                repost: false,
                                by: {
                                    name: "admin",
                                    handle: "administrator",
                                }
                            },

                        }
                    ]}
                    onComment={() => toast("Comment clicked")}
                    onRepost={() => toast("Repost clicked")}
                    onLike={() => toast("Like clicked")}
                    onBookmark={() => toast("Bookmark clicked")}
                    onShare={() => toast("Share clicked")}
                    onAnalytics={() => toast("Analytics clicked")}
                    onReport={() => toast("Report clicked")}
                />
            </div>

            <aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col py-4 px-4">
                <div className="mt-auto">
                    <Profile
                        profile={{
                            name: "Linus Kang",
                            handle: "linuskang",
                            image: "https://github.com/linuskang.png"
                        }}
                    />
                </div>
            </aside>

            <aside className="fixed right-0 top-0 h-screen w-80 hidden xl:flex flex-col py-8 gap-4 px-4 overflow-y-auto">
                <SearchBar />
                <StreakWidget />
                <AboutWidget />
                <RngWidget />
                <TrendingWidget />
                <InteractiveButton
                    defaultImage="/close.png"
                    hoverImage="/open.png"
                    onClick={() => toast("Interactive button clicked")}
                />
            </aside>
        </main>
    )
}