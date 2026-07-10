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

import { useRef, useState, useSyncExternalStore, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/md";
import { getGreeting } from "@/client/utils";
import { authClient } from "@/client/auth";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { CharCounter } from "./char-counter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { MentionSuggestions, useMentionSuggestions } from "@/components/mention-suggestions";
import { Paperclip } from "lucide-react";
import { Lock } from "lucide-react";
import axios from 'axios'

const subscribe = () => () => { };

export function Composer() {
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState<File[]>([]);
    const [attachmentPreviews, setAttachmentPreviews] = useState<string[]>([]);
    const [posting, setPosting] = useState(false);
    const [caret, setCaret] = useState(0);
    const [mode, setMode] = useState<"write" | "preview">("write");
    const [canPost, setCanPost] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const previewUrlsRef = useRef<string[]>([]);

    useEffect(() => {
        async function me() {
            try {
                await axios.get('/api/me').then((res) => {
                    if (res.data.canPost) {
                        setCanPost(true);
                    } else {
                        setCanPost(false);
                    }
                });
            } catch {
                toast.error("i couldnt check if you can post! please report this issue to an admin");
            }
        }

        me();
    }, []);

    const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
    const { data: session } = authClient.useSession();
    const hasContent = content.trim().length > 0 || attachments.length > 0;
    const mentions = useMentionSuggestions({
        value: content,
        caret,
        onChange: setContent,
        onCaretChange: (nextCaret) => {
            setCaret(nextCaret);
            requestAnimationFrame(() => {
                textareaRef.current?.focus();
                textareaRef.current?.setSelectionRange(nextCaret, nextCaret);
            });
        },
    });

    function setSelectedAttachments(files: File[]) {
        previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

        const previews = files.map((file) => URL.createObjectURL(file));
        previewUrlsRef.current = previews;
        setAttachments(files);
        setAttachmentPreviews(previews);
    }

    async function post() {
        setPosting(true);

        const uploadedAttachments = [];

        for (const attachment of attachments) {
            const formData = new FormData();
            formData.append("file", attachment);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const upload = await uploadRes.json();

            uploadedAttachments.push(
                {
                    name: upload.name,
                    url: upload.url,
                    type: upload.type ?? null,
                }
            );
        }

        const res = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
                attachments: uploadedAttachments,
            }),
        });

        if (!res.ok) {
            setPosting(false);
            toast.error(res.statusText);
            return;
        }

        setContent("");
        setSelectedAttachments([]);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setMode("write");
        setPosting(false);
        toast.success("Post created!");
    }

    if (!hydrated || !session) {
        return null;
    }

    const greeting = getGreeting(new Date(), session.user.name ?? "there");

    return (
        <div
            className={cn(
                "relative group flex max-w-lg flex-col gap-2 overflow-visible rounded-md border-2 border-border bg-card-primary p-4",
                "transition-[min-height,border-color] duration-300 ease-out hover:border-primary/80",
                hasContent
                    ? "min-h-[180px]"
                    : "min-h-[88px] has-[textarea:focus]:min-h-[180px]"
            )}
        >
            <div
                className={cn(
                    !canPost && "pointer-events-none select-none blur-[2px]"
                )}
            >
                <div className="flex items-start gap-4">
                    <Image
                        src={session.user.image!}
                        alt={session.user.name}
                        width={40}
                        height={40}
                        unoptimized
                        className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                        <div
                            className={cn(
                                "relative overflow-visible transition-[height] duration-300 ease-out",
                                hasContent
                                    ? "h-28"
                                    : "h-10 group-has-[textarea:focus]:h-28"
                            )}
                        >
                            {mode === "write" ? (
                                <div className="relative">
                                    <textarea
                                        ref={textareaRef}
                                        value={content}
                                        onChange={(e) => {
                                            setContent(e.target.value);
                                            setCaret(e.target.selectionStart);
                                        }}
                                        onClick={(e) => setCaret(e.currentTarget.selectionStart)}
                                        onKeyUp={(e) => setCaret(e.currentTarget.selectionStart)}
                                        placeholder={greeting}
                                        className="h-24 w-full resize-none bg-transparent py-1 text-lg leading-normal outline-none placeholder:text-muted-foreground"
                                    />
                                    <MentionSuggestions
                                        open={mentions.open}
                                        users={mentions.users}
                                        onSelect={mentions.selectUser}
                                        positionClassName="top-9 mt-1"
                                    />
                                </div>
                            ) : (
                                <div className="min-h-8 py-0.5 text-sm">
                                    {content.trim() ? (
                                        <Markdown>{content}</Markdown>
                                    ) : (
                                        <p className="text-muted-foreground">
                                            Nothing to preview.
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {attachmentPreviews.length > 0 && (
                            <div className="grid grid-cols-2 gap-2">
                                {attachmentPreviews.map((preview) => (
                                    <Image
                                        key={preview}
                                        src={preview}
                                        alt="Attachment preview"
                                        width={240}
                                        height={160}
                                        unoptimized
                                        className="h-36 w-full rounded-md border-2 border-border object-cover"
                                    />
                                ))}
                            </div>
                        )}

                        <div className="flex items-center justify-end -mb-2 gap-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={(event) => {
                                    const files = [
                                        ...attachments,
                                        ...Array.from(event.target.files ?? []),
                                    ].slice(0, 2);
                                    setSelectedAttachments(files);
                                    event.currentTarget.value = "";
                                }}
                            />

                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary"
                                disabled={posting || attachments.length >= 2}
                                aria-label="Upload images"
                                onMouseDown={(event) => event.preventDefault()}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Paperclip strokeWidth={3} />
                            </Button>

                            <Tabs
                                value={mode}
                                onValueChange={(value) =>
                                    setMode(value as "write" | "preview")
                                }
                            >
                                <TabsList className="!h-8 !rounded-full !bg-card">
                                    <TabsTrigger
                                        value="write"
                                        className="!rounded-full !border-2 !border-transparent data-[state=active]:!border-border"
                                    >
                                        Write
                                    </TabsTrigger>

                                    <TabsTrigger
                                        value="preview"
                                        className="!rounded-full !border-2 !border-transparent data-[state=active]:!border-border"
                                    >
                                        Preview
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            <CharCounter length={content.length} maxLength={400} />

                            <Button
                                size="sm"
                                className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                                disabled={!content.trim() || content.length > 400 || posting}
                                onClick={post}
                            >
                                {posting ? "Posting..." : "Post"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {!canPost && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-md bg-card-primary/70 p-4 text-center">
                    <Lock className="h-6 w-6 text-primary" strokeWidth={3} />
                    <p className="text-sm font-bold text-primary">
                        Posting is Locked!
                    </p>
                    <Button size="sm" className="mt-1 rounded-full" asChild>
                        <Link href="/quiz/post">
                            Complete the quiz
                        </Link>
                    </Button>
                </div>
            )}
        </div>
    );
}
