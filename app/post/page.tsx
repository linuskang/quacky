"use client";

import { Post } from "@/components/post";
import { toast } from "sonner";

export default function Page() {
    return (
        <main className="relative min-h-screen w-full flex justify-center items-center bg-background dark:bg-background">
            <div className="flex w-full max-w-lg">
                <div className="flex-1">
                    <Post
                        post={{
                            id: "1",
                            author: {
                                name: "Linus Kang",
                                handle: "linusdotmy",
                                image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                verified: false,
                                staff: true
                            },
                            content: "Hello, this is a sample *post component*. ``You`` can **customize it** as you like!\n\nMoreover, newline is supported!\nContact me at https://linus.my",
                            createdAt: "2026-06-24T22:55Z",
                            edited: false,
                            flagged: false,
                            views: 100,
                            quote: {
                                by: {
                                    name: "John Doe",
                                    handle: "johndoe",
                                },
                                post: {
                                    id: "2",
                                    author: {
                                        name: "Linus Kang",
                                        handle: "linusdotmy",
                                        image: "https://api.dicebear.com/9.x/glass/svg?seed=Linus",
                                        verified: false,
                                        staff: true
                                    },
                                    content: "This is a quoted post. You can click on it to view the original post.",
                                    createdAt: "2026-06-24T22:55Z",
                                    edited: true,
                                    flagged: false,
                                }
                            },
                            likes: 50,
                            reposts: 10,
                            comments: 5,
                            repost: {
                                repost: false,
                                by: {
                                    name: "admin",
                                    handle: "administrator",
                                }
                            },
                        }}
                        onComment={() => toast("Comment clicked")}
                        onRepost={() => toast("Repost clicked")}
                        onLike={() => toast("Like clicked")}
                        onBookmark={() => toast("Bookmark clicked")}
                        onShare={() => toast("Share clicked")}
                        onAnalytics={() => toast("Analytics clicked")}
                        onReport={() => toast("Report clicked")}
                    />
                </div>
            </div>
        </main>
    )
}