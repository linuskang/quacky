//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

"use client"

// Libraries
import { startTransition, useEffect, useState } from "react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

// Components
import { InfinitePostList } from "@/components/posts/infinite-post-list"
import { Composer } from "@/components/composer"
import { Tabs } from "@/components/posts/post-tabs"
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import Loading from "../loading"
import { SuggestedPeopleFeedCard } from "@/components/suggested-people"
import { SearchBar } from "@/components/search-bar"
import { StreakWidget } from "@/components/widgets/streak"
import { AboutWidget } from "@/components/widgets/about"
import { ParentEmailWidget } from "@/components/widgets/parent-email"
import { authClient } from "@/client/auth"

import Link from "next/link"

// Types
import { RngWidget } from "@/components/widgets/rng"

const tabs = [
    { name: "Recent", id: "recent" },
    { name: "Following", id: "following" },
    { name: "Popular", id: "popular" },
] as const

type FeedTab = (typeof tabs)[number]["id"]

export default function Page() {
    const [activeTab, setActiveTab] = useState<FeedTab>("recent")
    const [isNewUser, setIsNewUser] = useState(false)
    const { data: session } = authClient.useSession()
    const createdAt = session?.user.createdAt

    const {
        data,
        isLoading: loading,
        isError,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = trpc.posts.feed.useInfiniteQuery(
        { tab: activeTab, limit: 15 },
        {
            getNextPageParam: (lastPage) => lastPage.nextCursor,
        }
    )

    const posts = data?.pages.flatMap((page) => page.items) ?? []

    useEffect(() => {
        if (isError) {
            toast.error("Something went wrong")
        }
    }, [isError])

    useEffect(() => {
        const nextIsNewUser = createdAt
            ? new Date(createdAt).getTime() >
              Date.now() - 14 * 24 * 60 * 60 * 1000
            : false

        startTransition(() => setIsNewUser(nextIsNewUser))
    }, [createdAt])

    return (
        <PageLayout>
            <PageCenter>
                {session?.user.emailVerified === false && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-1 rounded relative" role="alert">
                        <span className="text-sm block sm:inline"> Please verify your email to access all features. </span>
                    </div>
                )}
                {isNewUser && (
                    <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-1 rounded relative" role="alert">
                        <span className="text-sm block sm:inline">Welcome to Quacky! Learn more about Quacky and how to play <Link href="/resources/about" className="underline">here</Link>.</span>
                    </div>
                )}
                <Composer />
                <Tabs
                    tabs={[...tabs]}
                    activeTab={activeTab}
                    onSelect={(tab) => setActiveTab(tab as FeedTab)}
                />
                {loading ? (
                    <Loading />
                ) : (
                    <InfinitePostList
                        posts={posts}
                        hasNextPage={Boolean(hasNextPage)}
                        isFetchingNextPage={isFetchingNextPage}
                        fetchNextPage={fetchNextPage}
                        afterFirst={
                            activeTab == "recent" && <SuggestedPeopleFeedCard /> // jank i know lmao
                        }
                    />
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
                <StreakWidget />
                <ParentEmailWidget />
                <AboutWidget />
                <RngWidget />
            </PageRight>
        </PageLayout>
    )
}
