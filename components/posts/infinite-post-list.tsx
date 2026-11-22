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

import { useEffect, useMemo, useRef } from "react"
import { Loader2 } from "lucide-react"

import { PostList } from "@/components/posts/post"
import type { Post } from "@/types"

type InfinitePostListProps = {
    posts: Post[]
    afterFirst?: React.ReactNode
    hasNextPage: boolean
    isFetchingNextPage: boolean
    fetchNextPage: () => unknown
}

export function InfinitePostList({
    posts,
    afterFirst,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
}: InfinitePostListProps) {
    const sentinelRef = useRef<HTMLDivElement>(null)

    const uniquePosts = useMemo(() => {
        const seen = new Set<string>()
        return posts.filter((post) => {
            if (seen.has(post.id)) return false
            seen.add(post.id)
            return true
        })
    }, [posts])

    useEffect(() => {
        const sentinel = sentinelRef.current
        if (!sentinel || !hasNextPage || isFetchingNextPage) return

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0]?.isIntersecting) {
                    void fetchNextPage()
                }
            },
            { rootMargin: "300px" }
        )

        observer.observe(sentinel)
        return () => observer.disconnect()
    }, [hasNextPage, isFetchingNextPage, fetchNextPage])

    return (
        <div className="flex w-full max-w-lg flex-col gap-4">
            <PostList posts={uniquePosts} afterFirst={afterFirst} />

            {hasNextPage && <div ref={sentinelRef} className="h-1 w-full" />}

            {isFetchingNextPage && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Loading more posts...</span>
                </div>
            )}

            {!hasNextPage && uniquePosts.length > 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">
                    You&apos;ve reached the end.
                </p>
            )}
        </div>
    )
}
