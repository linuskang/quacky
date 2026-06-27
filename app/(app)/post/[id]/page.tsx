"use client";

import { PostCard } from "@/components/post";
import { SearchBar } from "@/components/search-bar";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { useState, useEffect } from "react";
import { Post } from "@/types";
import { toast } from "sonner";
import RelevantPeopleWidget from "@/components/relevant-people";
import { useParams } from "next/navigation";
import { CommentCard, CommentList } from "@/components/comment";

export default function Page() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    console.log(id)

    const [post, setPost] = useState<Post>();

    useEffect(() => {
        async function fetchPost() {
            const res = await fetch(`/api/posts/${id}`);

            if (!res.ok) {
                toast.error(res.statusText);
                return;
            }

            const data = await res.json();

            if (!data) {
                toast.error("Post not found");
                return;
            }

            setPost(data);
        }
        fetchPost();
    }, []);

    return (
        <PageLayout>
            <PageCenter>
                {post && (
                    <>
                        <PostCard
                            post={post}
                        />
                        <CommentList
                            comments={post.postComments || []}
                            postId={post.id}
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