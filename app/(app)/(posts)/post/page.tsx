"use client";

import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { Composer } from "@/components/composer";
import { SearchBar } from "@/components/search-bar";
import { TrendingWidget } from "@/components/widgets/trending";

export default function Page() {
    return (
        <PageLayout>
            <PageCenter>
                <Composer />
            </PageCenter>
            <PageRight>
                <SearchBar />
                <TrendingWidget />
            </PageRight>
        </PageLayout>
    )
}