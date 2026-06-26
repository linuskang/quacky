"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/md";
import { getGreeting } from "@/client/utils";
import { authClient } from "@/client/auth";

export function Composer() {
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"write" | "preview">("write");
    const [active, setActive] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const { data: session } = authClient.useSession();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node) &&
                !content.trim()
            ) {
                setActive(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [content]);

    if (!session) {
        return null;
    }

    const user = session.user;

    const greeting = getGreeting(
        new Date(),
        user.name
    );

    return (
        <div
            ref={containerRef}
            className={`flex max-w-lg flex-col gap-2 overflow-hidden rounded-md border-2 border-border bg-card-primary p-4 transition-all duration-300 ease-out hover:border-primary/80 ${active ? "min-h-[180px]" : "min-h-[88px]"
                }`}
        >
            <div className="flex items-start gap-3">
                <Image
                    src={
                        user.image ||
                        `https://api.dicebear.com/9.x/glass/svg?seed=${user.username}`
                    }
                    alt={user.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                    {mode === "write" ? (
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            onFocus={() => setActive(true)}
                            placeholder={greeting}
                            className={`w-full resize-none bg-transparent text-lg outline-none placeholder:text-muted-foreground transition-all duration-300 ease-out ${active
                                ? "h-24 py-1"
                                : "h-10 py-0 leading-10"
                                }`}
                        />
                    ) : (
                        <div className="min-h-8 py-0.5 text-sm">
                            <Markdown>{content}</Markdown>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-1">
                <button
                    type="button"
                    onClick={() => setMode("write")}
                    className={`rounded px-2 py-1 text-xs font-semibold transition ${mode === "write"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                        }`}
                >
                    Write
                </button>

                <button
                    type="button"
                    onClick={() => setMode("preview")}
                    className={`rounded px-2 py-1 text-xs font-semibold transition ${mode === "preview"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                        }`}
                >
                    Preview
                </button>

                <Button
                    size="sm"
                    className="ml-2 h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                >
                    Post
                </Button>
            </div>
        </div>
    );
}