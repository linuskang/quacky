import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Tabs({
    tabs,
}: {
    tabs: {
        name: string;
        href: string;
        count?: number;
        current: boolean;
    }[];
}) {
    return (
        <div className="flex w-full items-center justify-start gap-2">
            {tabs.map((tab) => (
                <Button
                    key={tab.name}
                    variant="default"
                    aria-current={tab.current ? "page" : undefined}
                    className={cn(
                        "flex h-8 items-center gap-2 rounded-full border-2 bg-card-primary px-4 py-3 text-sm font-semibold hover:bg-card/50 hover:border-primary hover:text-primary",
                        tab.current
                            ? "border-primary text-primary"
                            : "border-border text-primary/80"
                    )}
                >
                    {tab.name}
                    {tab.count !== undefined && (
                        <span>{tab.count}</span>
                    )}
                </Button>
            ))}
        </div>
    );
}