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
import axios from "axios"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

// Components
import Loading from "@/components/loading"
import { PostCard } from "@/components/posts/post"
import { SearchBar } from "@/components/search-bar"
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import RelevantPeople from "@/components/widgets/relevant-people"

import { CommentCard, CommentList } from "@/components/comment"

// Types
import type { Comment, Post, User } from "@/types"

type CommentData = {
    comment: Comment
    post: Post
}

export default function Page() {
    const params = useParams()
    const id = params.id

    const [data, setData] = useState<CommentData>()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchComment() {
            setLoading(true)

            try {
                await axios.get(`/api/comments/${id}`).then((res) => {
                    setData(res.data)
                })
            } catch {
                toast.error("Comment not found")
            } finally {
                setLoading(false)
            }
        }
        fetchComment()
    }, [id])

    const comments =
        data?.post.postComments?.filter(
            (comment) => comment.id !== data.comment.id
        ) ?? []

    const relevantUsers: User[] = data
        ? Array.from(
            new Map(
                [
                    data.post.author,
                    data.comment.author,
                    ...comments.map((comment) => comment.author),
                ].map((user) => [user.username, user])
            ).values()
        )
        : []

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
                            <PostCard post={data.post} />
                        </div>
                        <CommentList
                            comments={comments}
                            postId={data.post.id}
                        />
                    </div>
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
                <RelevantPeople users={relevantUsers} />
            </PageRight>
        </PageLayout>
    )
}
