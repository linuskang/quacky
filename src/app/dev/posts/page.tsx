import Post from "@/components/quacky/posts";

export default function PostPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-background dark:bg-background">
            <div className="flex flex-col w-full max-w-2xl gap-4 px-4">

                <Post
                    posts={[
                        {
                            id: "1",
                            type: "post",
                            createdAt: new Date().toISOString(),
                            readOnly: false,
                            pinned: true,
                            isHidden: false,
                            isDeleted: false,
                            viewCount: 0,
                            content: "Hello this is a test post. There isn't much to say, but I just wanted to test the post component. I hope it works well!\n\n#testing #quacky",
                            author: {
                                id: "1",
                                name: "Linus Kang",
                                handle: "linuskang",
                                verified: true,
                            },
                        },
                    ]}
                />
            </div>
        </main>
    );
}
