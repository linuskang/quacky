import { cn } from "@/lib/utils";

interface Props {
    className?: string;
    size?: "sm" | "md" | "lg";
}

export default function Loading({ className, size = "md" }: Props) {

    const ballSize = cn({
        "w-2.5 h-2.5": size === "sm",
        "w-4 h-4": size === "md",
        "w-6 h-6": size === "lg",
    });

    const gapSize = cn({
        "gap-x-1.5": size === "sm",
        "gap-x-2": size === "md",
        "gap-x-3": size === "lg",
    });

    return (
        <div className="fixed inset-0 min-h-screen w-full flex items-center justify-center z-50">
            <div className={cn("flex items-center justify-center", gapSize, className)}>
                <div
                    className={cn("bg-primary rounded-full animate-bounce", ballSize)}
                    style={{ animationDuration: '1s' }}
                />

                <div
                    className={cn("bg-primary rounded-full animate-bounce", ballSize)}
                    style={{ animationDuration: '1s', animationDelay: '0.15s' }}
                />

                <div
                    className={cn("bg-primary rounded-full animate-bounce", ballSize)}
                    style={{ animationDuration: '1s', animationDelay: '0.3s' }}
                />
            </div>
        </div>
    );
}
