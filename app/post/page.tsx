"use client";

import { Post } from "@/components/post";

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
                                verified: true
                            },
                            content: "Hello, this is a sample *post component*. ``You`` can **customize it** as you like!\n\nMoreover, newline is supported!\nContact me at https://linus.my",
                            createdAt: new Date().toISOString(),
                            edited: true,
                            flagged: true,
                            repost: {
                                repost: true,
                                by: {
                                    name: "admin",
                                    handle: "administrator",
                                }
                            },
                            attachments: [
                                {
                                    name: "Sample Attachment",
                                    url: "https://api.dicebear.com/9.x/glass/svg?seed=Linus"
                                },
                            ],

                        }}
                    />
                </div>
            </div>
        </main>
    )
}