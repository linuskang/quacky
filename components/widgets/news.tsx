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
import Image from "next/image"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

function normalizeArray<T>(value: T | T[] | undefined): T[] {
    if (value === undefined || value === null) {
        return []
    }
    return Array.isArray(value) ? value : [value]
}

type MediaContent = {
    "@_url"?: string
    "@_medium"?: string
    "@_type"?: string
    "@_width"?: string
    "@_height"?: string
    "@_isDefault"?: string | boolean
}

type MediaGroup = {
    "media:description"?: string
    "media:content"?: MediaContent | MediaContent[]
    "media:thumbnail"?: MediaContent | MediaContent[]
    description?: string
    content?: MediaContent | MediaContent[]
    thumbnail?: MediaContent | MediaContent[]
}

type NewsItem = {
    title?: string
    link?: string
    description?: string
    "dc:creator"?: string
    creator?: string
    pubDate?: string
    category?: string | string[]
    "media:group"?: MediaGroup
    media_group?: MediaGroup
    group?: MediaGroup
}

function getMediaGroup(item: NewsItem): MediaGroup | undefined {
    return item["media:group"] ?? item.media_group ?? item.group
}

function getImageUrl(group: MediaGroup | undefined): string | undefined {
    if (!group) return undefined

    const contents = normalizeArray(
        group["media:content"] ?? group.content
    ) as MediaContent[]

    const defaultContent = contents.find(
        (c) => c["@_isDefault"] === "true" || c["@_isDefault"] === true
    )
    const firstContent = contents[0]
    const contentUrl = defaultContent?.["@_url"] ?? firstContent?.["@_url"]
    if (contentUrl) return contentUrl

    const thumbnails = normalizeArray(
        group["media:thumbnail"] ?? group.thumbnail
    ) as MediaContent[]
    return thumbnails[0]?.["@_url"]
}

function getCreator(item: NewsItem): string | undefined {
    return item["dc:creator"] ?? item.creator
}

function extractItems(parsedData: unknown): NewsItem[] {
    const data = parsedData as Record<string, unknown> | undefined
    const channel = (data?.rss as Record<string, unknown> | undefined)?.channel
    const items = (channel as Record<string, unknown> | undefined)?.item

    if (!Array.isArray(items)) {
        return []
    }

    return items.slice(0, 3)
}

export function NewsWidget() {
    const [items, setItems] = useState<NewsItem[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchNews() {
            try {
                const res = await fetch("/api/news")

                if (!res.ok) {
                    return
                }

                const json = (await res.json()) as {
                    parsedData?: unknown
                }
                setItems(extractItems(json.parsedData))
            } catch {
                // silently fail; widget stays empty
            } finally {
                setLoading(false)
            }
        }

        fetchNews()
    }, [])

    if (loading) {
        return (
            <div className="rounded-lg border-2 border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                    loading headlines...
                </p>
            </div>
        )
    }

    if (items.length === 0) {
        return (
            <div className="rounded-lg border-2 border-border bg-card p-4">
                <p className="text-sm text-muted-foreground">
                    no headlines right now.
                </p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4">
            {items.map((item, index) => {
                const group = getMediaGroup(item)
                const imageUrl = getImageUrl(group)
                const creator = getCreator(item)
                const date = item.pubDate
                    ? formatDistanceToNow(new Date(item.pubDate), {
                          addSuffix: true,
                      })
                    : undefined

                return (
                    <Link
                        key={index}
                        href={item.link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex gap-4 overflow-hidden rounded-lg border-2 border-border bg-card p-3 transition hover:border-primary/80"
                    >
                        {imageUrl && (
                            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-muted">
                                <Image
                                    src={imageUrl}
                                    alt={item.title || "News image"}
                                    fill
                                    unoptimized
                                    className="object-cover transition group-hover:opacity-95"
                                />
                            </div>
                        )}

                        <div className="flex min-w-0 flex-col gap-1">
                            <h2 className="line-clamp-2 text-sm font-bold text-primary group-hover:underline">
                                {item.title || "Untitled"}
                            </h2>

                            {item.description && (
                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                    {item.description.replace(/<[^>]+>/g, "")}
                                </p>
                            )}

                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                {creator && <span>by {creator}</span>}
                                {creator && date && <span>·</span>}
                                {date && <span>{date}</span>}
                            </div>
                        </div>
                    </Link>
                )
            })}
        </div>
    )
}
