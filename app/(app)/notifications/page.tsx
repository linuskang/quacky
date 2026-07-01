
// Libraries
import { requireSession } from "@/server/auth";
import { fetchNotifications } from "@/server/notifications";

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Notifications } from "@/components/notification";

export default async function Page() {
    const session = await requireSession();
    const notifications = await fetchNotifications({
        userId: session.user.id
    });

    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Your Notifications</h1>
                <Notifications notifications={notifications} />
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    )
}