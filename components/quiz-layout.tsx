import { Card } from "@/components/ui/card"
import { Markdown } from "@/components/markdown-renderer"
import { cn } from "@/lib/utils"

export function QuizLayout({
    theory,
    children,
}: {
    theory?: string
    children: React.ReactNode
}) {
    return (
        <div
            className={cn(
                "grid w-full min-w-0 gap-8",
                theory
                    ? "lg:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)]"
                    : "lg:grid-cols-1"
            )}
        >
            {theory && (
                <Card className="min-w-0 border-2 border-border !bg-none p-6 lg:sticky lg:top-4 lg:max-h-[calc(100dvh-2rem)] lg:overflow-y-auto">
                    <Markdown>{theory}</Markdown>
                </Card>
            )}
            <div className="min-w-0 space-y-3">{children}</div>
        </div>
    )
}
