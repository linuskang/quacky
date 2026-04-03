// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useState } from "react";
import { useRouter } from "next/navigation";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Types
interface Props {
    postId: string;
    onReplySuccess?: () => void;
}

export default function Reply({ postId, onReplySuccess }: Props) {
    const router = useRouter();

    // states
    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const reply = async () => {

        try {
            setIsPosting(true);
            // fetch
            const res = await fetch(`/api/v1/posts/${postId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: content.trim() }),
            });

            if (!res.ok) {
                const data = await res.json();
                console.log(data.error)
                return;
            }

            // reset inputs
            setContent("");

            // trigger callback to refresh post data
            if (onReplySuccess) {
                onReplySuccess();
            } else {
                router.refresh();
            }
        } catch {
            console.error("Failed to reply");
        } finally {
            setIsPosting(false);
        }
    };

    return (
        <div className="w-full max-w-xl">
            <div className="flex items-center gap-2">
                <Input
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Reply..."
                    maxLength={280}
                    className="h-10 rounded-lg !bg-[var(--lynt)]"
                />

                <Button
                    onClick={reply}
                    disabled={isPosting || content.trim().length === 0}
                    className="h-10 rounded-lg px-4 font-bold"
                >
                    {isPosting ? "Replying..." : "Reply"}
                </Button>
            </div>
        </div>
    );
}
