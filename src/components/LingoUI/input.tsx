import * as React from "react"
import { cn } from "@/lib/utils"

function LingoInput({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                // Base Style: Added w-full so it fills the container
                "flex w-full bg-white dark:bg-zinc-950 px-4 py-2 text-base transition-all outline-none",
                "rounded-md border-2 border-b-[4px] border-zinc-200 dark:border-zinc-800",

                // File and Placeholder
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",

                // Hover
                "hover:bg-zinc-50 dark:hover:bg-zinc-900",

                // Focus: Using !border-primary to ensure it overrides any gray borders passed via props
                "focus-visible:!border-primary focus-visible:border-b-[4px]",

                // Disabled
                "disabled:pointer-events-none disabled:opacity-50",

                className
            )}
            {...props}
        />
    )
}

export { LingoInput }