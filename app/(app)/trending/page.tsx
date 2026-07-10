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
import { fetchTrending } from "@/server/posts"
import Link from "next/link"

// Components
import { AboutWidget } from "@/components/widgets/about"
import { PageCenter, PageLayout, PageRight } from "@/components/page-layout"
import { SearchBar } from "@/components/search-bar"
import { TrendingWidget } from "@/components/widgets/trending"
import { Title } from "@/components/text"

export default async function TrendingPage() {
    const hashtags = await fetchTrending()
    return (
        <PageLayout>
            <PageCenter>
                <Title>trending now</Title>

                <div className="rounded-lg border-2 border-border bg-card">
                    {hashtags.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                            no hashtags trending yet.
                        </p>
                    ) : (
                        hashtags.map((hashtag) => (
                            <Link
                                key={hashtag.tag}
                                href={`/trending/${hashtag.tag}`}
                                className="flex items-center justify-between px-4 py-3"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="font-semibold text-primary-2">
                                        #{hashtag.tag}
                                    </span>
                                </div>

                                <span className="text-sm text-muted-foreground">
                                    {hashtag.count.toLocaleString()}
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            </PageCenter>
            <PageRight>
                <SearchBar />
                <TrendingWidget />
                <AboutWidget />
            </PageRight>
        </PageLayout>
    )
}
