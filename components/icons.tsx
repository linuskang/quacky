//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

"use client"

import * as React from "react"
import { BadgeCheck, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export function Github() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            fill="currentColor"
            viewBox="0 0 16 16"
        >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
        </svg>
    )
}

function BadgeTooltipWrapper({
    label,
    children,
}: {
    label: string
    children: React.ReactNode
}) {
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                    <span
                        className="inline-flex shrink-0 cursor-default items-center outline-none select-none"
                        tabIndex={0}
                        title={label}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {children}
                    </span>
                </TooltipTrigger>
                <TooltipContent sideOffset={4} className="text-xs font-semibold">
                    {label}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}

export function AdminBadge({ className }: { className?: string } = {}) {
    return (
        <BadgeTooltipWrapper label="Admin">
            <ShieldCheck
                className={cn(
                    "h-4 w-4 shrink-0 fill-primary text-background",
                    className
                )}
                aria-label="Admin"
            />
        </BadgeTooltipWrapper>
    )
}

export { AdminBadge as Admin }

export function BotBadge({ className }: { className?: string } = {}) {
    return (
        <BadgeTooltipWrapper label="Bot">
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={cn("h-4 w-4 shrink-0 text-primary", className)}
                aria-label="Bot"
            >
                <path
                    d="M12 8V4H8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <path
                    d="M2 14h2M20 14h2"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M6 8h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2zM9 12a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1zM15 12a1 1 0 0 0-1 1v2a1 1 0 0 0 2 0v-2a1 1 0 0 0-1-1z"
                    fill="currentColor"
                    stroke="none"
                />
            </svg>
        </BadgeTooltipWrapper>
    )
}

export { BotBadge as Bot }

export function VerifiedBadge({ className }: { className?: string } = {}) {
    return (
        <BadgeTooltipWrapper label="Verified">
            <BadgeCheck
                className={cn(
                    "h-4 w-4 shrink-0 fill-primary text-background",
                    className
                )}
                aria-label="Verified"
            />
        </BadgeTooltipWrapper>
    )
}
