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

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export interface Unreads {
    notifications: number
    dms: number
    fuzzies: number
}

export function useUnreads() {
    const pathname = usePathname()
    const [unreads, setUnreads] = useState<Unreads>({
        notifications: 0,
        dms: 0,
        fuzzies: 0,
    })

    useEffect(() => {
        const controller = new AbortController()

        void fetch("/api/me", { signal: controller.signal })
            .then(async (res) =>
                res.ok ? ((await res.json()) as { unreads?: Partial<Unreads> }) : null
            )
            .then((data) => {
                if (!data?.unreads) return
                setUnreads({
                    notifications: data.unreads.notifications ?? 0,
                    dms: data.unreads.dms ?? 0,
                    fuzzies: data.unreads.fuzzies ?? 0,
                })
            })
            .catch((error) => {
                if (error instanceof DOMException && error.name === "AbortError") return
            })

        return () => controller.abort()
    }, [pathname])

    return unreads
}
