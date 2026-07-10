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

import Link from "next/link"
import { useEffect, useState } from "react"
import { TrendingUp } from "lucide-react"
import { Widget, WidgetContent, WidgetSecondaryHeader } from "./widget"

type TrendingHashtag = {
    tag: string
    count: number
}

export function TrendingWidget() {
    const [hashtags, setHashtags] = useState<TrendingHashtag[]>([])

    useEffect(() => {
        const fetchTrending = async () => {
            const res = await fetch("/api/trending")

            if (!res.ok) {
                return
            }

            setHashtags(await res.json())
        }

        fetchTrending()
    }, [])

    return (
        <Widget>
            <WidgetSecondaryHeader>
                <div className="flex items-center">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold">trending now</h1>
                    </div>
                    <TrendingUp className="ml-2 h-5 w-5" strokeWidth={3} />
                </div>
            </WidgetSecondaryHeader>
            <WidgetContent>
                <p className="text-sm text-muted-foreground">
                    see whats popular right now.
                </p>

                <div className="mt-3 space-y-3">
                    {hashtags.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            no hashtags trending yet.
                        </p>
                    ) : (
                        hashtags.map((hashtag) => (
                            <Link
                                key={hashtag.tag}
                                href={`/trending/${hashtag.tag}`}
                                className="flex items-center justify-between hover:underline"
                            >
                                <span className="font-semibold text-primary-2">
                                    #{hashtag.tag}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                    {hashtag.count.toLocaleString()}
                                </span>
                            </Link>
                        ))
                    )}
                </div>
            </WidgetContent>
        </Widget>
    )
}
