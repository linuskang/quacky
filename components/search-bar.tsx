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

"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import type { ComponentProps } from "react";

type SearchBarProps = ComponentProps<typeof Input>;

export function SearchBar({
    placeholder = "Search for stuff...",
    className,
    ...props
}: SearchBarProps) {
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="relative w-full">
                <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/85"
                    strokeWidth={3}
                />

                <Input
                    type="text"
                    placeholder={placeholder}
                    className={`w-full rounded-md border-2 border-border focus:!border-chart-3 !bg-card pl-8 h-9 !ring-0 !text-primary ${className ?? ""}`}
                    {...props}
                />
            </div>
        </div>
    );
}
