
import { SearchBar } from "@/components/search-bar";
import { StreakWidget } from "@/components/widgets/streak";
import { AboutWidget } from "@/components/widgets/about";
import { RngWidget } from "@/components/widgets/rng";
import { TrendingWidget } from "@/components/widgets/trending";

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