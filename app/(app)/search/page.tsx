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
import { Description, Title } from "@/components/text"
import { SearchResults } from "./search-results"

export default async function Page() {
    const session = await requireSession()

    const posts = await fetchPosts({
        userId: session.user.id,
    })

    const [users, hashtags] = await Promise.all([
        fetchSearchUsers(),
        fetchSearchHashtags(),
    ])

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
            </PageCenter>
            <PageRight>
                <TrendingWidget />
            </PageRight>
        </PageLayout>
    )
}
