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
import axios from "axios"
import { useEffect, useState } from "react"
import { toast } from "sonner"

// Components
import { PostList } from "@/components/posts/post"
import { Composer } from "@/components/composer"
import { Tabs } from "@/components/posts/post-tabs"
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import Loading from "../loading"
import { SuggestedPeopleFeedCard } from "@/components/suggested-people"
import { SearchBar } from "@/components/search-bar"
import { StreakWidget } from "@/components/widgets/streak"
import { AboutWidget } from "@/components/widgets/about"

// Types
import type { Post } from "@/types"

const tabs = [
    { name: "Recent", id: "recent" },
    { name: "Following", id: "following" },
    { name: "Popular", id: "popular" },
]

export default function Page() {
    const [activeTab, setActiveTab] = useState("recent")
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadPosts() {
            setLoading(true)
            try {
                const endpoints: Record<string, string> = {
                    recent: "/api/posts",
                    following: "/api/posts/following",
                    popular: "/api/posts/popular",
                }

                await axios.get(endpoints[activeTab]).then((res) => {
                    setPosts(res.data)
                })
            } catch (error) {
                console.error(error)
                toast.error("Something went wrong")
                setPosts([])
            } finally {
                setLoading(false)
            }
        }

        loadPosts()
    }, [activeTab])

    return (
        <PageLayout>
            <PageCenter>
                <Composer />
                <Tabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onSelect={setActiveTab}
                />
                {loading ? (
                    <Loading />
                ) : (
                    <PostList
                        posts={posts}
                        afterFirst={
                            activeTab == "recent" && <SuggestedPeopleFeedCard /> // jank i know lmao
                        }
                    />
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
                <StreakWidget />
                <AboutWidget />

            </PageRight>
        </PageLayout>
    )
}
