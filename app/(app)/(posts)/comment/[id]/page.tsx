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

// Libraries
import { toast } from "sonner"
import { useEffect } from "react"
import { useParams } from "next/navigation"
import { trpc } from "@/lib/trpc"

// Components
import Loading from "@/components/loading"
import { PostCard } from "@/components/posts/post"
import { SearchBar } from "@/components/search-bar"
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import RelevantPeople from "@/components/widgets/relevant-people"

import { CommentCard, CommentList } from "@/components/comment"

export default function Page() {
    const params = useParams()
    const id = String(params.id ?? "")

    const { data, isLoading: loading, isError } = trpc.comments.byId.useQuery(
        { id },
        { enabled: Boolean(id) }
    )

    useEffect(() => {
        if (isError) {
            toast.error("Comment not found")
        }
    }, [isError])

    return (
        <PageLayout>
            <PageCenter>
                {loading && <Loading />}
                {data && (
                    <div>
                        <div className="mb-2 flex w-full max-w-lg flex-col gap-2">
                            <CommentCard comment={data.comment} />
                            <div className="flex h-16 items-center pl-10">
                                <div className="relative flex h-full items-center justify-center border-l-2 border-dotted border-border">
                                    <span className="px-4 text-sm font-semibold text-muted-foreground">
                                        Replying to
                                    </span>
                                </div>
                            </div>
                            <PostCard post={data.comment.post} />
                        </div>
                        <CommentList
                            comments={data.comment.comments}
                            postId={data.comment.post.id}
                        />
                    </div>
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
                {data && <RelevantPeople users={data.relevantUsers} />}
            </PageRight>
        </PageLayout>
    )
}
