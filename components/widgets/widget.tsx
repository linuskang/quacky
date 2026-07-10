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
import { cn } from "@/lib/utils"

export function Widget({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className="flex w-full items-center">
            <Card className={cn("w-full rounded-md border-2 border-border bg-card text-card-foreground pt-0 pb-0 shadow-sm", className)}>
                {children}
            </Card>
        </div>
    )
}

export function WidgetPrimaryHeader({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <CardHeader className={cn("rounded-tl-md rounded-tr-md !bg-card-header px-3 py-3", className)}>
            {children}
        </CardHeader>
    )
}

export function WidgetSecondaryHeader({
    children,
    className
}: {
    children: React.ReactNode
    className?: string
}) {
    return (
        <CardHeader className={cn("-mb-6 rounded-tl-md rounded-tr-md bg-card px-3 py-3", className)}>
            {children}
        </CardHeader>
    )
}

export function WidgetContent({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <CardContent className={cn("-mt-4 flex flex-col gap-3 px-3 py-3", className)}>
            {children}
        </CardContent>
    )
}
