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

"use client";

import { PostCard } from "@/components/post";
import { SearchBar } from "@/components/search-bar";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { useState, useEffect } from "react";
import type { Post, User } from "@/types";
import { toast } from "sonner";
import RelevantPeopleWidget from "@/components/widgets/relevant-people";
import { useParams } from "next/navigation";
import { CommentList } from "@/components/comment";

export default function Page() {
    const params = useParams<{ id: string }>();
    const id = params.id;

    const [post, setPost] = useState<Post>();

    const relevantUsers: User[] = post
        ? Array.from(
            new Map(
                [
                    post.author,
                    ...(post.postComments ?? []).map((comment) => comment.author),
                ].map((user) => [user.username, user])
            ).values()
        )
        : [];

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
    }, [id]);

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
                    users={relevantUsers}
                />
            </PageRight>
        </PageLayout>
    )
}
