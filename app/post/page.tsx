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
import { Feedback } from "@/components/bin";
import { Profile } from "@/components/profile";
import { Sidebar } from "@/components/sidebar";
import { PageLayout, PageCenter, PageLeft, PageRight } from "@/components/page-layout";

export default function Page() {
    return (
        <PageLayout>
            <PageLeft>
                <Sidebar
                    session={{
                        user: {
                            handle: "linusdotmy",
                            image: "https://github.com/linuskang.png",
                        }
                    }}
                />
                <div className="mt-auto">
                    <Profile
                        profile={{
                            name: "Linus Kang",
                            handle: "linuskang",
                            image: "https://github.com/linuskang.png"
                        }}
                    />
                </div>
            </PageLeft>

            <PageCenter>
                <Composer
                    onSubmit={({ content, files }) => {
                        toast("success");
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
                        }
                    ]}
                />
            </PageCenter>

            <PageRight>
                <SearchBar />
                <StreakWidget />
                <AboutWidget />
                <RngWidget />
                <TrendingWidget />
                <Feedback
                    defaultImage="/close.png"
                    hoverImage="/open.png"
                    onClick={() => toast("Interactive button clicked")}
                />
            </PageRight>
        </PageLayout>
    )
}