import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { prisma } from "@/server/prisma";
import { SearchBar } from "@/components/search-bar";
import { TrendingWidget } from "@/components/trending";

export default function Page() {
    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Search {":>"}</h1>

                <p className="text-xs -mt-2 text-muted-foreground">
                    "the feature that will be used by the 1% of users" - facedev
                </p>
                <SearchBar />
            </PageCenter>
            <PageRight>
                <TrendingWidget />
            </PageRight>
        </PageLayout>
    )
}