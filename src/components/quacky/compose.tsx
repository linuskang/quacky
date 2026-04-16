// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { authClient } from "@/client/auth";

// UI Components
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { CharacterCounter } from "@/components/quacky/character-counter";
import { BadgeCheck } from "lucide-react";

// Utilities
import { formatSize } from "@/client/utils";

// Types
import { PostAttachment } from "@/types";

const MAX_CHARS = 280;
const MAX_FILES = 3;

interface NewPost {
    id: string;
}

interface Props {
    onPost?: (result: NewPost) => void;
}

export default function Compose({ onPost }: Props) {
    const [content, setContent] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [attachments, setAttachments] = useState<PostAttachment[]>([]);

    // @mention autocomplete
    const [mentionQuery, setMentionQuery] = useState<string | null>(null);
    const [mentionResults, setMentionResults] = useState<Array<{
        id: string; name: string; handle: string; image: string | null; verified: boolean;
    }>>([]);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const { data: session } = authClient.useSession();

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

    const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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
        const ta = textareaRef.current;
        if (!ta) return;
        const cursorPos = ta.selectionStart ?? content.length;
        const before = content.substring(0, cursorPos);
        const after = content.substring(cursorPos);
        const updated = before.replace(/(?:^|(\s))@\w*$/, (_match, space) => `${space ?? ""}@${handle} `);
        setContent(updated + after);
        setMentionQuery(null);
        setMentionResults([]);
        ta.focus();
    };

    const getErrorMessage = async (res: Response, fallback: string) => {
        try {
            const data = await res.json();
            return data?.error || fallback;
        } catch {
            return fallback;
        }
    };

    const handleAttachmentChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const remainingSlots = MAX_FILES - attachments.length;
        if (remainingSlots <= 0) {
            alert(`You can only attach up to ${MAX_FILES} files.`);
            return;
        }

        const selected = files.slice(0, remainingSlots);
        if (files.length > remainingSlots) {
            alert(`Only the first ${remainingSlots} file(s) added. Max ${MAX_FILES} per post.`);
        }

        setIsUploading(true);
        const uploaded: PostAttachment[] = [];

        for (const file of selected) {
            const fd = new FormData();
            fd.append("file", file);
            fd.append("existingCount", String(attachments.length + uploaded.length));

            try {
                const res = await fetch("/api/v1/posts/upload", { method: "POST", body: fd });
                const data = await res.json();

                if (res.ok && data.attachment) {
                    uploaded.push(data.attachment);
                } else {
                    alert(await getErrorMessage(res, `Failed to upload ${file.name}`));
                }
            } catch (err) {
                alert(`Error uploading ${file.name}`);
            }
        }

        if (uploaded.length) setAttachments((prev) => [...prev, ...uploaded]);
        setIsUploading(false);
        e.target.value = "";
    };

    const handleSubmit = async () => {
        const trimmed = content.trim();
        if (trimmed.length > MAX_CHARS) return alert(`Post exceeds ${MAX_CHARS} characters`);

        setIsPosting(true);
        try {
            const res = await fetch("/api/v1/posts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: trimmed, attachments }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to post");

            setContent("");
            setAttachments([]);
            onPost?.(data.result);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsPosting(false);
        }
    };

    const isInvalid = (content.trim().length === 0 && attachments.length === 0) ||
        content.length > MAX_CHARS || isPosting || isUploading;

    return (
        <div className="rounded-xl bg-[var(--lynt)] border border-border p-4 w-full">
            <div className="flex gap-4">
                <Avatar className="w-12 h-12 shrink-0">
                    <AvatarImage src={session?.user.image || ""} alt={session?.user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                        {session?.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                <div className="flex-1 flex flex-col">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={handleContentChange}
                            onFocus={() => setIsFocused(true)}
                            onBlur={() => {
                                setIsFocused(false);
                                // Delay so clicks on mention results register first
                                setTimeout(() => {
                                    setMentionQuery(null);
                                    setMentionResults([]);
                                }, 150);
                            }}
                            placeholder={`What's happening, ${session?.user.name?.split(" ")[0]}?`}
                            className="w-full bg-transparent text-primary placeholder:text-muted-foreground resize-none outline-none text-lg font-medium min-h-[60px] py-1"
                            rows={isFocused || content ? 3 : 2}
                        />
                        {mentionResults.length > 0 && (
                            <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-[var(--lynt)] border border-border rounded-xl shadow-lg overflow-hidden">
                                {mentionResults.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        onMouseDown={(e) => { e.preventDefault(); insertMention(user.handle); }}
                                        className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-primary/10 transition text-left"
                                    >
                                        <Avatar className="w-7 h-7 shrink-0">
                                            <AvatarImage src={user.image || ""} />
                                            <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                                {user.name.charAt(0)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="font-semibold text-sm text-primary">{user.name}</span>
                                        {user.verified && (
                                            <BadgeCheck className="text-primary shrink-0" size={14} fill="currentColor" stroke="var(--lynt)" />
                                        )}
                                        <span className="text-muted-foreground text-sm">@{user.handle}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {attachments.length > 0 && (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {attachments.map((file, i) => (
                                <div key={`${file.key}-${i}`} className="rounded-lg border border-border p-2 bg-background/60">
                                    {file.kind === "image" && <img src={file.url} alt={file.name} className="w-full h-40 object-cover rounded-md" />}
                                    {file.kind === "video" && <video src={file.url} controls className="w-full h-40 object-cover rounded-md" />}
                                    {file.kind === "file" && (
                                        <div className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                                            <div className="font-semibold text-primary truncate">{file.name}</div>
                                            <div>{formatSize(file.size)}</div>
                                        </div>
                                    )}
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <div className="text-xs text-muted-foreground truncate">{file.name}</div>
                                        <button
                                            type="button"
                                            onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
                                            className="text-xs font-semibold px-2 py-1 rounded-md border border-border hover:bg-accent"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center justify-end pt-3 mt-2 gap-2">
                        <label className="px-3 py-2 rounded-full border border-border hover:bg-accent cursor-pointer text-sm font-semibold">
                            {isUploading ? "Uploading..." : `Attach (${attachments.length}/${MAX_FILES})`}
                            <input
                                type="file"
                                multiple
                                className="hidden"
                                onChange={handleAttachmentChange}
                                disabled={isUploading || attachments.length >= MAX_FILES}
                            />
                        </label>

                        <CharacterCounter length={content.length} />

                        <button
                            onClick={handleSubmit}
                            disabled={isInvalid}
                            className="px-6 py-2 rounded-full bg-primary hover:bg-primary/90 text-background text-base font-bold disabled:opacity-50 transition-colors"
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
