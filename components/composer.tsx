"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/md";
import { Paperclip, X } from "lucide-react";
import { toast } from "sonner";

import { getGreeting } from "@/client/utils";


const ACCEPTED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
];

const MAX_ATTACHMENTS = 2;

type Attachment = {
    file: File;
    url: string;
};

export function Composer({
    onSubmit,
    session,
}: {
    onSubmit: (data: { content: string; files: File[] }) => void;
    session: {
        user: {
            name: string;
            handle: string;
            image?: string | null;
        };
    };
}) {
    const [content, setContent] = useState("");
    const [mode, setMode] = useState<"write" | "preview">("write");
    const [active, setActive] = useState(false);
    const [files, setFiles] = useState<Attachment[]>([]);
    const greeting = useMemo(
        () => getGreeting(new Date(), session.user.name),
        [session.user.name],
    );

    const containerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(e.target as Node) &&
                !content &&
                files.length === 0
            ) {
                setActive(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, [content, files.length]);

    useEffect(() => {
        return () => {
            files.forEach((file) =>
                URL.revokeObjectURL(file.url),
            );
        };
    }, [files]);

    const gridClass =
        files.length === 1 ? "grid-cols-1" : "grid-cols-2";

    const addFiles = (list: FileList | null) => {
        if (!list) return;

        const validFiles = Array.from(list).filter((file) =>
            ACCEPTED_TYPES.includes(file.type),
        );

        if (!validFiles.length) {
            toast.error("Only images and GIFs are allowed");
            return;
        }

        const remaining = MAX_ATTACHMENTS - files.length;

        if (remaining <= 0) {
            toast.error(
                `Maximum ${MAX_ATTACHMENTS} attachments`,
            );
            return;
        }

        setFiles((prev) => [
            ...prev,
            ...validFiles
                .slice(0, remaining)
                .map((file) => ({
                    file,
                    url: URL.createObjectURL(file),
                })),
        ]);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => {
            URL.revokeObjectURL(prev[index].url);
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleSubmit = () => {
        const text = content.trim();

        if (!text) {
            toast.error("Content cannot be empty");
            return;
        }

        onSubmit({
            content: text,
            files: files.map((f) => f.file),
        });

        files.forEach((file) =>
            URL.revokeObjectURL(file.url),
        );

        setContent("");
        setFiles([]);
        setActive(false);
    };

    const renderAttachments = (removable = false) => (
        <div className={`mt-2 grid gap-2 ${gridClass}`}>
            {files.map((file, index) => (
                <div
                    key={index}
                    className={
                        removable
                            ? "relative group"
                            : undefined
                    }
                >
                    <Image
                        src={file.url}
                        alt={file.file.name}
                        width={500}
                        height={300}
                        unoptimized
                        className="h-full max-h-[300px] w-full rounded-md object-cover"
                    />

                    {removable && (
                        <button
                            onClick={() =>
                                removeFile(index)
                            }
                            className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={`flex max-w-lg flex-col gap-2 overflow-hidden rounded-md border-2 border-border bg-background p-4 transition-all duration-300 ease-out hover:border-primary/80 ${active ? "min-h-[180px]" : "min-h-[88px]"
                }`}
        >
            <div className="flex items-start gap-3">
                <Image
                    src={session.user.image || `https://api.dicebear.com/9.x/glass/svg?seed=${session.user.handle}`}
                    alt={session.user.name}
                    width={40}
                    height={40}
                    unoptimized
                    className="h-10 w-10 shrink-0 rounded-full object-cover"
                />

                <div className="min-w-0 flex-1">
                    {mode === "write" ? (
                        <>
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

                            {active &&
                                files.length > 0 &&
                                renderAttachments(
                                    true,
                                )}
                        </>
                    ) : (
                        <div className="min-h-8 py-0.5 text-sm">
                            {content && (
                                <Markdown>
                                    {content}
                                </Markdown>
                            )}

                            {files.length > 0 &&
                                renderAttachments()}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center justify-end gap-1">
                <button
                    onClick={() =>
                        setMode("write")
                    }
                    className={`rounded px-2 py-1 text-xs font-semibold transition ${mode === "write"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                        }`}
                >
                    Write
                </button>

                <button
                    onClick={() =>
                        setMode("preview")
                    }
                    className={`rounded px-2 py-1 text-xs font-semibold transition ${mode === "preview"
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-primary"
                        }`}
                >
                    Preview
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={ACCEPTED_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = "";
                    }}
                />

                <button
                    onClick={() =>
                        fileInputRef.current?.click()
                    }
                    className="cursor-pointer p-1 text-muted-foreground transition hover:text-primary"
                >
                    <Paperclip
                        size={18}
                        strokeWidth={2}
                    />
                </button>

                <Button
                    onClick={handleSubmit}
                    size="sm"
                    className="ml-2 h-8 cursor-pointer rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                >
                    Post
                </Button>
            </div>
        </div>
    );
}