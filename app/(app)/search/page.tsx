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

// Libraries
import { fetchSearchHashtags, fetchSearchUsers } from "@/server/search"
import { requireSession } from "@/server/auth"
import { fetchPosts } from "@/server/posts"

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import { TrendingWidget } from "@/components/widgets/trending"
import { NewsWidget } from "@/components/widgets/news"
import { Description, Title } from "@/components/text"
import { SearchResults } from "./search-results"
import Link from "next/link"
import { fetchTrending } from "@/server/posts"
import { SuggestedPeopleFeedCard } from "@/components/suggested-people"
import { RngWidget } from "@/components/widgets/rng"
import { QOTD } from "@/components/widgets/qotd"

export default async function Page() {
    const session = await requireSession()

    const posts = await fetchPosts({
        userId: session.user.id,
    })

    const [users, hashtags] = await Promise.all([
        fetchSearchUsers(),
        fetchSearchHashtags(),
    ])

    const trendingTags = await fetchTrending()

    return (
        <PageLayout>
            <PageCenter>
                <Title>Search {":>"}</Title>

                <Description>
                    &quot;the feature that will be used by the 1% of users&quot;
                    - facedev
                </Description>
                <SearchResults
                    posts={posts}
                    users={users}
                    hashtags={hashtags}
                />

                <Title>trending now</Title>

                <div className="rounded-lg border-2 border-border bg-card">
                    {trendingTags.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                            no hashtags trending yet.
                        </p>
                    ) : (
                        trendingTags.map((trendingTag) => (
                            <Link
                                key={trendingTag.tag}
                                href={`/trending/${trendingTag.tag}`}
                                className="flex items-center justify-between px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-primary-2">
                                        #{trendingTag.tag}
                                    </span>
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    {trendingTag.count.toLocaleString()}
                                </span>
                            </Link>
                        ))
                    )}
                </div>

                <Title>news</Title>
                <NewsWidget />

                <SuggestedPeopleFeedCard />
            </PageCenter>
            <PageRight>
                <TrendingWidget />
                {/* <RngWidget />
                <QOTD /> */}
            </PageRight>
        </PageLayout>
    )
}
