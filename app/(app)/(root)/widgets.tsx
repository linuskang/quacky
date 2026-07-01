
import { SearchBar } from "@/components/search-bar";
import { StreakWidget } from "@/components/streak";
import { AboutWidget } from "@/components/about";
import { RngWidget } from "@/components/rng";
import { TrendingWidget } from "@/components/trending";

export function HomepageWidgets() {
    return (
        <>
            <SearchBar />
            <StreakWidget />
            <AboutWidget />
            <RngWidget />
            <TrendingWidget />
        </>
    )
}