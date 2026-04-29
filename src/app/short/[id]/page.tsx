// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

import { use, useState, useEffect, useRef, Suspense, KeyboardEvent } from "react";
import Link from "next/link";
import { authClient } from "@/client/auth";
import {
    Loader2,
    X,
    Send,
    Heart,
    BadgeCheck,
    ChevronDown,
    MessageCircle,
} from "lucide-react";

import Login from "@/components/login";
import Sidebar from "@/components/quacky/sidebar";
import Discover from "@/components/quacky/discover";
import Loading from "@/components/loading";
import Short from "@/components/quacky/shorts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatTimestamp } from "@/client/utils";

import type { Short as ShortType } from "@/types";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    author: {
        id: string;
        name: string;
        handle: string;
        image?: string | null;
        verified: boolean;
    };
    likeCount: number;
    hasLiked: boolean;
    isOwn: boolean;
}

interface Props {
    params: Promise<{ id: string }>;
}

export default function ShortPage({ params }: Props) {
    return (
        <Suspense fallback={<Loading />}>
            <ShortPageContent params={params} />
        </Suspense>
    );
}

function ShortPageContent({ params }: Props) {
    const { data: session, isPending } = authClient.useSession();
    const { id } = use(params);

    const [short, setShort] = useState<ShortType | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Comments state
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsCursor, setCommentsCursor] = useState<string | null>(null);
    const [commentInput, setCommentInput] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    useEffect(() => {
        if (!session) return;
        fetch(`/api/v1/shorts/${id}`)
            .then(async (res) => {
                if (res.status === 404) { setNotFound(true); return; }
                const data = await res.json();
                if (data.short) setShort(data.short); else setNotFound(true);
            })
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [session, id]);

    const handleLike = async () => {
        if (!short) return;
        setShort((prev) =>
            prev ? { ...prev, hasLiked: !prev.hasLiked, likeCount: prev.hasLiked ? prev.likeCount - 1 : prev.likeCount + 1 } : prev
        );
        await fetch(`/api/v1/posts/${id}/like`, { method: "POST" }).catch(() => {});
    };

    const handleDelete = async () => {
        if (!confirm("Delete this short?")) return;
        const res = await fetch(`/api/v1/shorts/${id}`, { method: "DELETE" });
        if (res.ok) window.location.href = "/shorts";
    };

    const openComments = async () => {
        setCommentsOpen(true);
        if (comments.length > 0) return;
        setCommentsLoading(true);
        try {
            const res = await fetch(`/api/v1/shorts/${id}/comments`);
            const data = await res.json();
            setComments(data.comments ?? []);
            setCommentsCursor(data.nextCursor ?? null);
        } catch {}
        finally { setCommentsLoading(false); }
    };

    const submitComment = async () => {
        if (!commentInput.trim() || postingComment) return;
        const text = commentInput.trim();
        setCommentInput("");
        setPostingComment(true);
        try {
            const res = await fetch(`/api/v1/shorts/${id}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
            });
            const data = await res.json();
            if (data.comment) {
                setComments((prev) => [...prev, data.comment]);
                setShort((prev) => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
            }
        } catch {}
        finally { setPostingComment(false); }
    };

    const handleCommentKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); }
    };

    if (isPending || (session && loading)) return <Loading />;
    if (!session) return <Login />;

    return (
        <main className="h-screen w-full flex justify-center bg-background overflow-hidden">
            <div className="flex w-full max-w-[1200px] gap-4 px-4 h-full">
                <Sidebar session={session} />

                {/* Short viewer */}
                <div className="flex-1 min-w-0 h-full flex items-center justify-center py-6 gap-6">

                    {/* Video */}
                    <div className="h-full flex items-center">
                        {loading && (
                            <div className="w-72 h-full flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        )}

                        {!loading && notFound && (
                            <div className="w-72 h-full flex flex-col items-center justify-center gap-4 text-center">
                                <p className="text-base font-bold text-primary">Short not found</p>
                                <p className="text-sm text-muted-foreground">It may have been deleted.</p>
                                <Link href="/shorts" className="text-sm text-primary hover:underline font-semibold">
                                    Browse Shorts
                                </Link>
                            </div>
                        )}

                        {!loading && short && (
                            <div className="h-full aspect-[9/16] max-w-[380px] rounded-2xl overflow-hidden shadow-2xl relative">
                                <Short
                                    id={short.id}
                                    videoUrl={short.url}
                                    name={short.author.name}
                                    handle={short.author.handle}
                                    description={short.description}
                                    verified={short.author.verified}
                                    avatarUrl={short.author.image}
                                    likeCount={short.likeCount}
                                    hasLiked={short.hasLiked}
                                    onLike={handleLike}
                                    commentCount={short.commentCount}
                                    onCommentClick={openComments}
                                    isOwn={short.isOwn}
                                    onDelete={handleDelete}
                                />
                            </div>
                        )}
                    </div>

                    {/* Comments side panel */}
                    {short && (
                        <div className="hidden md:flex flex-col w-80 xl:w-96 h-full bg-[var(--lynt)] rounded-2xl border border-border overflow-hidden">
                            {/* Header */}
                            <div className="px-4 py-3.5 border-b border-border shrink-0 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={16} className="text-primary" />
                                    <h3 className="font-bold text-sm text-primary">
                                        {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "Comments"}
                                    </h3>
                                </div>
                                {!commentsOpen && (
                                    <button
                                        onClick={openComments}
                                        className="text-xs font-semibold text-primary hover:text-primary/70 transition-colors"
                                    >
                                        Load
                                    </button>
                                )}
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                                {!commentsOpen && !commentsLoading && (
                                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-8">
                                        <p className="text-xs text-muted-foreground">Click &ldquo;Load&rdquo; to see comments</p>
                                    </div>
                                )}

                                {commentsLoading && (
                                    <div className="flex justify-center py-8">
                                        <Loader2 className="animate-spin text-primary" size={22} />
                                    </div>
                                )}

                                {commentsOpen && !commentsLoading && comments.length === 0 && (
                                    <div className="flex flex-col items-center justify-center h-full py-12 gap-2 text-center">
                                        <p className="text-sm font-semibold text-primary">No comments yet</p>
                                        <p className="text-xs text-muted-foreground">Be the first!</p>
                                    </div>
                                )}

                                {comments.map((c) => (
                                    <CommentRow key={c.id} comment={c} />
                                ))}

                                {commentsCursor && (
                                    <button
                                        onClick={async () => {
                                            setCommentsLoading(true);
                                            try {
                                                const res = await fetch(`/api/v1/shorts/${id}/comments?cursor=${commentsCursor}`);
                                                const data = await res.json();
                                                setComments((prev) => [...prev, ...(data.comments ?? [])]);
                                                setCommentsCursor(data.nextCursor ?? null);
                                            } catch {}
                                            finally { setCommentsLoading(false); }
                                        }}
                                        className="w-full py-2 text-xs font-semibold text-primary hover:text-primary/70 flex items-center justify-center gap-1.5 transition-colors"
                                    >
                                        <ChevronDown size={13} />
                                        Load more
                                    </button>
                                )}
                            </div>

                            {/* Input */}
                            <div className="shrink-0 px-4 py-3 border-t border-border flex items-center gap-2.5">
                                <Avatar className="w-7 h-7 shrink-0">
                                    <AvatarImage src={session.user.image ?? ""} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                        {session.user.name.charAt(0)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 flex items-center gap-2 rounded-full bg-background border border-border px-3.5 py-2">
                                    <input
                                        value={commentInput}
                                        onChange={(e) => { setCommentInput(e.target.value); if (!commentsOpen) openComments(); }}
                                        onKeyDown={handleCommentKey}
                                        placeholder="Add a comment..."
                                        maxLength={280}
                                        className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted-foreground outline-none min-w-0"
                                    />
                                    <button
                                        onClick={submitComment}
                                        disabled={!commentInput.trim() || postingComment}
                                        className="shrink-0 text-primary disabled:text-muted-foreground transition-colors"
                                    >
                                        {postingComment
                                            ? <Loader2 size={15} className="animate-spin" />
                                            : <Send size={15} strokeWidth={2.5} />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <Discover session={session} />
            </div>
        </main>
    );
}

function CommentRow({ comment }: { comment: Comment }) {
    const [liked, setLiked] = useState(comment.hasLiked);
    const [count, setCount] = useState(comment.likeCount);

    const toggleLike = async () => {
        setLiked((v) => !v);
        setCount((v) => liked ? v - 1 : v + 1);
        await fetch(`/api/v1/posts/${comment.id}/like`, { method: "POST" }).catch(() => {});
    };

    return (
        <div className="flex gap-2.5 py-2.5 items-start">
            <Link href={`/${comment.author.handle}`}>
                <Avatar className="w-7 h-7 shrink-0">
                    <AvatarImage src={comment.author.image ?? ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-[10px]">
                        {comment.author.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Link href={`/${comment.author.handle}`} className="text-[11px] font-bold text-primary hover:underline">
                        {comment.author.name}
                    </Link>
                    {comment.author.verified && (
                        <BadgeCheck size={11} className="text-primary shrink-0" fill="currentColor" stroke="var(--lynt)" />
                    )}
                    <span className="text-[10px] text-muted-foreground">{formatTimestamp(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-primary mt-0.5 leading-relaxed break-words">{comment.content}</p>
            </div>
            <button onClick={toggleLike} className="shrink-0 flex flex-col items-center gap-0.5 pt-1 ml-1">
                <Heart
                    size={13}
                    className={liked ? "text-red-500" : "text-muted-foreground hover:text-primary transition-colors"}
                    fill={liked ? "currentColor" : "none"}
                />
                {count > 0 && <span className="text-[10px] text-muted-foreground">{count}</span>}
            </button>
        </div>
    );
}
