
// Libraries
import { requireSession } from "@/server/auth";
import { fetchNotifications } from "@/server/notifications";

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Notifications } from "@/components/notification";
import { Title } from "@/components/text";

export default async function Page() {
    const session = await requireSession();
    const notifications = await fetchNotifications({
        userId: session.user.id
    });

    return (
        <PageLayout>
            <PageCenter>
                <Title>Your Notifications</Title>
                <Notifications notifications={notifications} />
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    )
}