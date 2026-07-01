import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { TrendingWidget } from "@/components/widgets/trending";
import { Title } from "@/components/text";

export default function Page() {
    return (
        <PageLayout>
            <PageCenter>
                <Title>Search {":>"}</Title>

                <p className="text-xs -mt-2 text-muted-foreground">
                    &quot;the feature that will be used by the 1% of users&quot; - facedev
                </p>
                <SearchBar />
            </PageCenter>
            <PageRight>
                <TrendingWidget />
            </PageRight>
        </PageLayout>
    )
}