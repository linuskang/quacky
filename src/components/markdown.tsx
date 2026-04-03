// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Types
interface MarkdownRendererProps {
    filePath?: string;
    content?: string;
}

export default function MarkdownRenderer({ filePath, content: initialContent }: MarkdownRendererProps) {
    const [content, setContent] = useState<string>(initialContent ?? "");
    const [loading, setLoading] = useState(initialContent === undefined);

    useEffect(() => {
        if (initialContent !== undefined || !filePath) {
            return;
        }

        const fetchMarkdown = async () => {
            try {
                const response = await fetch(filePath);
                const text = await response.text();
                setContent(text);
            } catch (error) {
                console.error("Failed to load markdown:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMarkdown();
    }, [filePath, initialContent]);

    if (loading) {
        return <div className="text-center text-muted-foreground">Loading...</div>;
    }

    const title = content.split("\n")[0];
    const titleText = title.startsWith("# ") ? title.substring(2) : "Document";
    const markdownContent = content.split("\n").slice(1).join("\n");

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative px-4 py-8 sm:py-0">
            <div className="w-full max-w-xl">
                <div className="backdrop-blur-md p-6 sm:p-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary dark:text-primary-dark mb-2">
                            {titleText}
                        </h1>
                    </div>

                    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                        <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({ node, ...props }) => (
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary dark:text-primary-dark mt-8 mb-4" {...props} />
                                ),
                                h2: ({ node, ...props }) => (
                                    <h2 className="text-lg font-bold text-primary dark:text-primary-dark mt-6 mb-3" {...props} />
                                ),
                                h3: ({ node, ...props }) => (
                                    <h3 className="text-base font-semibold text-primary dark:text-primary-dark mt-4 mb-2" {...props} />
                                ),
                                p: ({ node, ...props }) => (
                                    <p className="text-sm text-muted-foreground leading-relaxed my-3" {...props} />
                                ),
                                ul: ({ node, ...props }) => (
                                    <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground my-3" {...props} />
                                ),
                                ol: ({ node, ...props }) => (
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground my-3" {...props} />
                                ),
                                li: ({ node, ...props }) => (
                                    <li className="text-sm text-muted-foreground" {...props} />
                                ),
                                code: ({ node, className, ...props }: any) => (
                                    className ? (
                                        <code className="block bg-muted p-3 rounded-lg text-xs font-mono text-foreground overflow-x-auto my-3 whitespace-pre" {...props} />
                                    ) : (
                                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground" {...props} />
                                    )
                                ),
                                pre: ({ node, ...props }) => (
                                    <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-3" {...props} />
                                ),
                                table: ({ node, ...props }) => (
                                    <table className="w-full border-collapse my-3 text-sm" {...props} />
                                ),
                                thead: ({ node, ...props }) => (
                                    <thead className="border-b border-border" {...props} />
                                ),
                                tbody: ({ node, ...props }) => (
                                    <tbody {...props} />
                                ),
                                tr: ({ node, ...props }) => (
                                    <tr className="border-b border-border last:border-b-0" {...props} />
                                ),
                                th: ({ node, ...props }) => (
                                    <th className="text-left px-3 py-2 font-semibold text-foreground bg-muted/50" {...props} />
                                ),
                                td: ({ node, ...props }) => (
                                    <td className="text-left px-3 py-2 text-muted-foreground" {...props} />
                                ),
                                blockquote: ({ node, ...props }) => (
                                    <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground my-3" {...props} />
                                ),
                                a: ({ node, ...props }) => (
                                    <a className="text-primary hover:underline" {...props} />
                                ),
                                strong: ({ node, ...props }) => (
                                    <strong className="font-semibold text-foreground" {...props} />
                                ),
                                em: ({ node, ...props }) => (
                                    <em className="italic" {...props} />
                                ),
                                hr: ({ node, ...props }) => (
                                    <hr className="border-border my-4" {...props} />
                                ),
                            }}
                        >
                            {markdownContent}
                        </ReactMarkdown>
                    </div>

                    <div className="mt-8 text-xs text-muted-foreground text-center">
                        <p>© 2026 Linus Kang. Quacky is licensed under the CC BY-NC 4.0 license. </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
