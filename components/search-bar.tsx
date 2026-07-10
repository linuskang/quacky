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

import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import type { ComponentProps } from "react"

type SearchBarProps = ComponentProps<typeof Input>

export function SearchBar({
    placeholder = "Search for stuff...",
    className,
    ...props
}: SearchBarProps) {
    return (
        <div className="flex w-full items-center gap-2">
            <div className="relative w-full">
                <Search
                    className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-primary/85"
                    strokeWidth={3}
                />

                <Input
                    type="text"
                    placeholder={placeholder}
                    className={`h-9 w-full rounded-md border-2 border-border !bg-card pl-8 !text-primary !ring-0 focus:!border-chart-3 ${className ?? ""}`}
                    {...props}
                />
            </div>
        </div>
    )
}
