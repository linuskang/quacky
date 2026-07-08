import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Tabs({
    tabs,
    activeTab,
    onSelect,
}: {
    tabs: {
        name: string;
        id: string;
    }[];
    activeTab: string;
    onSelect: (id: string) => void;
}) {
    return (
        <div className="flex w-full items-center justify-start gap-2">
            {tabs.map((tab) => (
                <Button
                    key={tab.id}
                    type="button"
                    variant="default"
                    aria-current={activeTab === tab.id ? "page" : undefined}
                    className={cn(
                        "flex h-8 items-center gap-2 rounded-full border-2 bg-card-primary px-4 py-3 text-sm font-semibold hover:bg-card/50 hover:border-primary hover:text-primary",
                        activeTab === tab.id
                            ? "border-primary text-primary"
                            : "border-border text-primary/80"
                    )}
                    onClick={() => onSelect(tab.id)}
                >
                    {tab.name}
                </Button>
            ))}
        </div>
    );
}
