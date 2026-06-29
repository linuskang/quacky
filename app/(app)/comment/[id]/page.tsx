"use client";

import { PostCard } from "@/components/post";
import { SearchBar } from "@/components/search-bar";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { useState, useEffect } from "react";
import type { Comment, Post } from "@/types";
import { toast } from "sonner";
import RelevantPeopleWidget from "@/components/relevant-people";
import { useParams } from "next/navigation";
import { CommentCard, CommentList } from "@/components/comment";

type CommentPageData = {
    comment: Comment;
    post: Post;
};

export default function Page() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [data, setData] = useState<CommentPageData>();

    useEffect(() => {
        async function fetchComment() {
            const res = await fetch(`/api/comments/${id}`);

            if (!res.ok) {
                toast.error(res.statusText);
                return;
            }

            const data = await res.json();

            if (!data.comment || !data.post) {
                toast.error("Comment not found");
                return;
            }

            setData(data);
        }
        fetchComment();
    }, [id]);

    const comments = data?.post.postComments?.filter((comment) => comment.id !== data.comment.id) ?? [];

    return (
        <PageLayout>
            <PageCenter>
                {data && (
                    <>
                        <div className="flex w-full max-w-lg flex-col gap-2">
                            <CommentCard
                                comment={data.comment}
                            />
                            <div className="flex h-16 items-center pl-10">
                                <div className="relative flex h-full items-center justify-center border-l-2 border-dotted border-border">
                                    <span className="bg-background px-2 text-sm font-semibold text-muted-foreground">
                                        Replying to
                                    </span>
                                </div>
                            </div>
                            <PostCard
                                post={data.post}
                            />
                        </div>
                        <CommentList
                            comments={comments}
                            postId={data.post.id}
                        />
                    </>
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
                <RelevantPeopleWidget
                    users={[
                        {
                            name: "Linus",
                            username: "linusdotmy",
                            image: "https://avatars.githubusercontent.com/u/10000000?v=4",
                            verified: true,
                            role: "admin",
                        },
                        {
                            name: "John Doe",
                            username: "johndoe",
                            image: "https://avatars.linus.my/10.x/glass/svg?seed=linus",
                            verified: false,
                            role: "user",
                        },
                    ]}
                />
            </PageRight>
        </PageLayout>
    )
}
