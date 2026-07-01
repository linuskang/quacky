// Libraries
import { fetchPosts } from "@/server/posts";
import { requireSession } from "@/server/auth";

// Components
import { PostList } from "@/components/post";
import { Composer } from "@/components/composer";
import { Tabs } from "@/components/post-tabs";
import { HomepageWidgets } from "./widgets";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";

export default async function Page() {
    const session = await requireSession();

    const posts = await fetchPosts({
        userId: session.user.id
    });

    return (
        <PageLayout>
            <PageCenter>
                <Composer />
                <Tabs
                    tabs={[
                        { name: "Recent", href: "#", current: true },
                        { name: "For you", href: "#foryou", current: false },
                        { name: "Following", href: "#following", current: false },
                        { name: "Popular", href: "#popular", current: false },
                    ]}
                />
                <PostList posts={posts} />
            </PageCenter>
            <PageRight>
                <HomepageWidgets />
            </PageRight>
        </PageLayout>
    )
}