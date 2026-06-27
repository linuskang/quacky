"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/md";
import { getGreeting } from "@/client/utils";
import { authClient } from "@/client/auth";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import { CharCounter } from "./char-counter";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function Composer() {
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"write" | "preview">("write");

    const { data: session } = authClient.useSession();
    const hasContent = content.trim().length > 0;

    async function post() {
        const res = await fetch("/api/posts", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content }),
        });

        if (!res.ok) {
            toast.error(res.statusText);
            return;
        }

        setContent("");
        setMode("write");
        toast.success("Post created!");
    }

    if (!session) {
        return null;
    }

    const greeting = getGreeting(new Date(), session.user.name);

    return (
        <div
            className={cn(
                "group flex max-w-lg flex-col gap-2 overflow-hidden rounded-md border-2 border-border bg-card-primary p-4",
                "transition-[min-height,border-color] duration-300 ease-out hover:border-primary/80",
                hasContent
                    ? "min-h-[180px]"
                    : "min-h-[88px] has-[textarea:focus]:min-h-[180px]"
            )}
        >
            <div className="flex items-start gap-4">
                <Image
                    src={session.user.image ?? "/default-avatar.png"}
                    alt={session.user.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                <div
                    className={cn(
                        "min-w-0 flex-1 overflow-hidden transition-[height] duration-300 ease-out",
                        hasContent
                            ? "h-28"
                            : "h-10 group-has-[textarea:focus]:h-28"
                    )}
                >
                    {mode === "write" ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={greeting}
                            className="h-24 w-full resize-none bg-transparent py-1 text-lg leading-normal outline-none placeholder:text-muted-foreground"
                        />
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
            </div>

            <div className="flex items-center justify-end -mb-2 gap-1">
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
                    disabled={!content.trim() || content.length > 400}
                    onClick={post}
                >
                    Post
                </Button>
            </div>
        </div>
    );
}