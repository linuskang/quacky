import Replies from "@/components/quacky/replies";

export default function PostPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-background dark:bg-background">
            <div className="flex flex-col w-full max-w-2xl gap-4 px-4">

                <Replies
                    replies={[
                        {
                            id: "1",
                            type: "reply",
                            createdAt: new Date().toISOString(),
                            content: "Hello this is a test reply. There isn't much to say, but I just wanted to test the reply component. I hope it works well!\n\n#testing #quacky",
                            viewCount: 0,
                            readOnly: false,
                            pinned: false,
                            isHidden: false,
                            isDeleted: false,
                            author: {
                                id: "1",
                                name: "Linus Kang",
                                handle: "linuskang",
                                verified: true,
                            },
                        }
                    ]}
                />
            </div>
        </main>
    );
}
