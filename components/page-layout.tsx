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

import { cn } from "@/lib/utils"

type Props = {
    children: React.ReactNode
    className?: string
}

export function PageLayout({ children, className }: Props) {
    return (
        <main
            className={cn("relative min-h-dvh w-full", className)}
        >
            {children}
        </main>
    )
}

export function PageCenter({ children, className }: Props) {
    return (
        <div
            className={cn(
                "mx-auto my-0 flex w-full max-w-xl flex-col gap-3 px-4 py-4",
                className
            )}
        >
            {children}
        </div>
    )
}

export function PageLeft({ children, className }: Props) {
    return (
        <aside
            className={cn(
                "fixed top-0 left-0 hidden h-screen w-64 flex-col px-4 py-4 lg:flex",
                className
            )}
        >
            {children}
        </aside>
    )
}

export function PageRight({ children, className }: Props) {
    return (
        <aside
            className={cn(
                "fixed top-0 right-0 hidden h-screen w-80 flex-col gap-4 overflow-y-auto px-4 py-8 xl:flex",
                className
            )}
        >
            {children}
        </aside>
    )
}
