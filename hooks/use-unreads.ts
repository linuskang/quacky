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

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trpc } from "@/lib/trpc"

export interface Unreads {
    notifications: number
    dms: number
    fuzzies: number
}

export function useUnreads(): Unreads {
    const pathname = usePathname()
    const utils = trpc.useUtils()
    const { data } = trpc.me.get.useQuery()

    useEffect(() => {
        void utils.me.get.invalidate()
    }, [pathname, utils])

    return {
        notifications: data?.unreads.notifications ?? 0,
        dms: data?.unreads.dms ?? 0,
        fuzzies: data?.unreads.fuzzies ?? 0,
    }
}
