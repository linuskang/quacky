"use client"

import { useTheme } from "next-themes"

export function GooseBg() {
    const { theme } = useTheme()

    if (theme === "dark") {
        return (
            <div className="goose-wallpaper" />
        )
    }
}