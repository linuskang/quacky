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

import { authClient } from "@/client/auth";
import { redirect } from "next/navigation";

export default function Page() {

    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!session) {
        redirect("/auth/login");
    }

    return (
        <PageLayout>


            <PageCenter>
                <Composer />
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
                            updatedAt: "2026-06-25T10:00Z",
                            edited: false,
                            flagged: false,
                            views: 100,
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
                <Feedback />
            </PageRight>
        </PageLayout>
    )
}