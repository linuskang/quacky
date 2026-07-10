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

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Dices } from "lucide-react"

import {
    Widget,
    WidgetSecondaryHeader,
    WidgetContent,
} from "@/components/widgets/widget"

export function RngWidget() {
    return (
        <Widget>
            <WidgetSecondaryHeader>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <h1 className="text-lg font-bold">rng?</h1>
                        <Dices className="ml-2 h-5 w-5" strokeWidth={3} />
                    </div>
                </div>
            </WidgetSecondaryHeader>

            <WidgetContent>
                <p className="text-sm text-muted-foreground">
                    you get one random number per day, biggest number wins.{" "}
                    <Link
                        href="/rng"
                        className="font-semibold text-primary-2 hover:underline"
                    >
                        view leaderboard
                    </Link>
                    .
                </p>

                <Button
                    variant="default"
                    className="mt-4 flex h-8 items-center gap-2 rounded-full bg-primary-2 px-4 py-3 text-sm font-semibold text-background"
                >
                    <Link href="/rng">roll a number</Link>
                </Button>
            </WidgetContent>
        </Widget>
    )
}
