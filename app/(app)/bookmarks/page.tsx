// Libraries
import { fetchBookmarks } from "@/server/bookmarks";
import { requireSession } from "@/server/auth";

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { PostList } from "@/components/post";
import { SearchBar } from "@/components/search-bar";

export default async function Page() {
    const session = await requireSession();
    const bookmarks = await fetchBookmarks({
        userId: session.user.id
    });

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Your Bookmarks</h1>
                <PostList
                    posts={bookmarks}
                />
            </PageCenter>
            <PageRight>
                <SearchBar

                />
            </PageRight>
        </PageLayout>
    )
}