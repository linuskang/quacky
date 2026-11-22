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

import { trpc } from "@/lib/trpc"
import { InfinitePostList } from "@/components/posts/infinite-post-list"
import type { Post } from "@/types"

const PROFILE_POSTS_PAGE_SIZE = 15

export function ProfilePosts({
    handle,
    initialPage,
}: {
    handle: string
    initialPage: {
        items: Post[]
        nextCursor: string | null
    }
}) {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
        trpc.posts.byUser.useInfiniteQuery(
            { handle, limit: PROFILE_POSTS_PAGE_SIZE },
            {
                getNextPageParam: (lastPage) => lastPage.nextCursor,
                initialData: {
                    pages: [initialPage],
                    pageParams: [undefined],
                },
            }
        )

    const posts = data?.pages.flatMap((page) => page.items) ?? initialPage.items

    return (
        <InfinitePostList
            posts={posts}
            hasNextPage={Boolean(hasNextPage)}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
        />
    )
}
