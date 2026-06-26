import { Button } from "@/components/ui/button";

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
                <div key={tab.name}>
                    <Button
                        variant="default"
                        className="flex items-center bg-card-primary border-2 border-border h-8 gap-2 rounded-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-card/50 hover:border-primary text-primary/80 hover:text-primary"

                        aria-current={tab.current ? "page" : undefined}
                    >
                        {tab.name}

                    </Button>
                </div>
            ))}
        </div>
    );
}