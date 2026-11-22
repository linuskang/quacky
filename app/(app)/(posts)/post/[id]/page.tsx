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
import { useParams } from "next/navigation"
import { useEffect } from "react"
import { trpc } from "@/lib/trpc"

// Components
import { PostCard } from "@/components/posts/post"
import { SearchBar } from "@/components/search-bar"
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import RelevantPeopleWidget from "@/components/widgets/relevant-people"
import { CommentList } from "@/components/comment"
import Loading from "@/components/loading"

// Types
import type { User } from "@/types"

export default function Page() {
    const params = useParams()
    const id = String(params.id ?? "")

    const { data: post, isLoading: load, isError } = trpc.posts.byId.useQuery(
        { id },
        { enabled: Boolean(id) }
    )

    useEffect(() => {
        if (isError) {
            toast.error("Post not found")
        }
    }, [isError])

    const relevantUsers: User[] = post
        ? Array.from(
              new Map(
                  [
                      post.author,
                      ...(post.postComments ?? []).map(
                          (comment) => comment.author
                      ),
                  ].map((user) => [user.username, user])
              ).values()
          )
        : []

    return (
        <PageLayout>
            <PageCenter>
                {load && <Loading />}
                {post && (
                    <>
                        <PostCard post={post} />
                        <CommentList
                            comments={post.postComments || []}
                            postId={post.id}
                        />
                    </>
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
                <RelevantPeopleWidget users={relevantUsers} />
            </PageRight>
        </PageLayout>
    )
}
