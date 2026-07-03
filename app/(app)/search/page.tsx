import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { TrendingWidget } from "@/components/widgets/trending";
import { Title } from "@/components/text";
import { requireSession } from "@/server/auth";
import { fetchPosts } from "@/server/posts";
import { fetchSearchHashtags, fetchSearchUsers } from "@/server/search";
import { SearchResults } from "./search-results";

export default async function Page() {
    const session = await requireSession();
    const posts = await fetchPosts({
        userId: session.user.id,
    });
    const [users, hashtags] = await Promise.all([
        fetchSearchUsers(),
        fetchSearchHashtags(),
    ]);

    return (
        <PageLayout>
            <PageCenter>
                <Title>Search {":>"}</Title>

                <p className="text-xs -mt-2 text-muted-foreground">
                    &quot;the feature that will be used by the 1% of users&quot; - facedev
                </p>
                <SearchResults posts={posts} users={users} hashtags={hashtags} />
            </PageCenter>
            <PageRight>
                <TrendingWidget />
            </PageRight>
        </PageLayout>
    )
}
