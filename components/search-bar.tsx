"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="relative w-full">
                <Search
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-primary/85"
                    strokeWidth={3}
                />

                <Input
                    type="text"
                    placeholder="Search for stuff..."
                    className="w-full rounded-md border-2 border-border !bg-card pl-8 h-9 !ring-0 !text-primary"
                />
            </div>
        </div>
    );
}