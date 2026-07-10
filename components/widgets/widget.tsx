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

import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function Widget({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex w-full items-center">
            <Card className="w-full overflow-hidden border-2 border-border p-0">
                {children}
            </Card>
        </div>
    )
}

export function WidgetPrimaryHeader({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <CardHeader className="rounded-tl-md rounded-tr-md !bg-card-header px-3 py-3">
            {children}
        </CardHeader>
    )
}

export function WidgetSecondaryHeader({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <CardHeader className="-mb-6 rounded-tl-md rounded-tr-md bg-card px-3 py-3">
            {children}
        </CardHeader>
    )
}

export function WidgetContent({ children }: { children: React.ReactNode }) {
    return (
        <CardContent className="-mt-4 flex flex-col gap-3 px-3 py-3">
            {children}
        </CardContent>
    )
}
