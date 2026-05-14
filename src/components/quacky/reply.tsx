// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// UI Components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { BadgeCheck } from "lucide-react";

// Types
interface Props {
    postId: string;
    onReplySuccess?: () => void;
}

export default function Reply({ postId, onReplySuccess }: Props) {
    const router = useRouter();

    const [content, setContent] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionResults, setMentionResults] = useState<Array<{
        id: string; name: string; handle: string; image: string | null; verified: boolean;
    }>>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (mentionQuery === null || mentionQuery.length === 0) {
            setMentionResults([]);
            return;
        }
        const controller = new AbortController();
        fetch(`/api/v1/users/search?q=${encodeURIComponent(mentionQuery)}`, { signal: controller.signal })
            .then((r) => r.json())
            .then((data) => setMentionResults((data.users ?? []).slice(0, 5)))
            .catch(() => {});
        return () => controller.abort();
    }, [mentionQuery]);

    const handleContentChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setContent(val);
        const cursorPos = e.target.selectionStart ?? val.length;
        const textBeforeCursor = val.substring(0, cursorPos);
        const mentionMatch = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);
        if (mentionMatch) {
            setMentionQuery(mentionMatch[1]);
        } else {
            setMentionQuery(null);
            setMentionResults([]);
        }
    };

    const insertMention = (handle: string) => {
        const input = inputRef.current;
        if (!input) return;
        const cursorPos = input.selectionStart ?? content.length;
        const before = content.substring(0, cursorPos);
        const after = content.substring(cursorPos);
        const updated = before.replace(/(?:^|(\s))@\w*$/, (_match, space) => `${space ?? ""}@${handle} `);
        setContent(updated + after);
        setMentionQuery(null);
        setMentionResults([]);
        input.focus();
    };

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
                <div className="relative flex-1">
                    <Input
                        ref={inputRef}
                        value={content}
                        onChange={handleContentChange}
                        onBlur={() => {
                            setTimeout(() => {
                                setMentionQuery(null);
                                setMentionResults([]);
                            }, 150);
                        }}
                        placeholder="Reply..."
                        maxLength={400}
                        className="h-10 rounded-lg !bg-[var(--lynt)]"
                    />
                    {mentionResults.length > 0 && (
                        <div className="absolute left-0 right-0 bottom-full z-50 mb-1 bg-[var(--lynt)] border border-border rounded-xl shadow-lg overflow-hidden">
                            {mentionResults.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onMouseDown={(e) => { e.preventDefault(); insertMention(user.handle); }}
                                    className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-primary/10 transition text-left"
                                >
                                    <Avatar className="w-6 h-6 shrink-0">
                                        <AvatarImage src={user.image || ""} />
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                            {user.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="font-semibold text-sm text-primary">{user.name}</span>
                                    {user.verified && (
                                        <BadgeCheck className="text-primary shrink-0" size={13} fill="currentColor" stroke="var(--lynt)" />
                                    )}
                                    <span className="text-muted-foreground text-sm">@{user.handle}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

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
