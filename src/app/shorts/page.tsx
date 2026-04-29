// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

import {
    useState,
    useEffect,
    useRef,
    useCallback,
    Suspense,
    KeyboardEvent,
} from "react";
import Link from "next/link";
import { authClient } from "@/client/auth";
import {
    Clapperboard,
    Upload,
    X,
    Loader2,
    AlertCircle,
    Plus,
    Send,
    Heart,
    BadgeCheck,
    ChevronDown,
} from "lucide-react";

import Sidebar from "@/components/quacky/sidebar";
import Login from "@/components/login";
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

export default function ShortsPage() {
    return (
        <Suspense fallback={<Loading />}>
            <ShortsPageContent />
        </Suspense>
    );
}

function ShortsPageContent() {
    const { data: session, isPending } = authClient.useSession();

    const [shorts, setShorts] = useState<ShortType[]>([]);
    const [nextCursor, setNextCursor] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // Comments state
    const [commentsShortId, setCommentsShortId] = useState<string | null>(null);
    const [comments, setComments] = useState<Comment[]>([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsCursor, setCommentsCursor] = useState<string | null>(null);
    const [commentInput, setCommentInput] = useState("");
    const [postingComment, setPostingComment] = useState(false);

    // Upload state
    const [showUpload, setShowUpload] = useState(false);

    const feedRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    // ── Fetch feed ──
    const fetchShorts = useCallback(async (cursor?: string) => {
        const url = cursor ? `/api/v1/shorts?cursor=${cursor}` : "/api/v1/shorts";
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to load shorts");
        return res.json() as Promise<{ shorts: ShortType[]; nextCursor: string | null }>;
    }, []);

    useEffect(() => {
        if (!session) return;
        setLoading(true);
        fetchShorts()
            .then(({ shorts: s, nextCursor: nc }) => { setShorts(s); setNextCursor(nc); })
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, [session, fetchShorts]);

    // ── Intersection observer (active short tracking) ──
    useEffect(() => {
        const feed = feedRef.current;
        if (!feed) return;

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const idx = itemRefs.current.findIndex((el) => el === entry.target);
                        if (idx !== -1) setActiveIndex(idx);
                    }
                }
            },
            { root: feed, threshold: 0.55 }
        );
        itemRefs.current.forEach((el) => el && observer.observe(el));
        return () => observer.disconnect();
    }, [shorts]);

    // ── Load more near end ──
    useEffect(() => {
        if (activeIndex >= shorts.length - 2 && nextCursor && !loadingMore) {
            setLoadingMore(true);
            fetchShorts(nextCursor)
                .then(({ shorts: more, nextCursor: nc }) => {
                    setShorts((prev) => [...prev, ...more]);
                    setNextCursor(nc);
                })
                .catch(() => {})
                .finally(() => setLoadingMore(false));
        }
    }, [activeIndex, shorts.length, nextCursor, loadingMore, fetchShorts]);

    // ── Like ──
    const handleLike = async (shortId: string) => {
        setShorts((prev) =>
            prev.map((s) =>
                s.id === shortId
                    ? { ...s, hasLiked: !s.hasLiked, likeCount: s.hasLiked ? s.likeCount - 1 : s.likeCount + 1 }
                    : s
            )
        );
        try { await fetch(`/api/v1/posts/${shortId}/like`, { method: "POST" }); }
        catch { /* revert */ setShorts((prev) => prev.map((s) => s.id === shortId ? { ...s, hasLiked: !s.hasLiked, likeCount: s.hasLiked ? s.likeCount - 1 : s.likeCount + 1 } : s)); }
    };

    // ── Delete ──
    const handleDelete = async (shortId: string) => {
        if (!confirm("Delete this short? This can't be undone.")) return;
        const res = await fetch(`/api/v1/shorts/${shortId}`, { method: "DELETE" });
        if (res.ok) setShorts((prev) => prev.filter((s) => s.id !== shortId));
    };

    // ── Comments ──
    const openComments = async (shortId: string) => {
        setCommentsShortId(shortId);
        setComments([]);
        setCommentsCursor(null);
        setCommentsLoading(true);
        try {
            const res = await fetch(`/api/v1/shorts/${shortId}/comments`);
            const data = await res.json();
            setComments(data.comments ?? []);
            setCommentsCursor(data.nextCursor ?? null);
        } catch {}
        finally { setCommentsLoading(false); }
    };

    const closeComments = () => {
        setCommentsShortId(null);
        setComments([]);
        setCommentInput("");
    };

    const loadMoreComments = async () => {
        if (!commentsShortId || !commentsCursor || commentsLoading) return;
        setCommentsLoading(true);
        try {
            const res = await fetch(`/api/v1/shorts/${commentsShortId}/comments?cursor=${commentsCursor}`);
            const data = await res.json();
            setComments((prev) => [...prev, ...(data.comments ?? [])]);
            setCommentsCursor(data.nextCursor ?? null);
        } catch {}
        finally { setCommentsLoading(false); }
    };

    const submitComment = async () => {
        if (!commentsShortId || !commentInput.trim() || postingComment) return;
        const text = commentInput.trim();
        setCommentInput("");
        setPostingComment(true);
        try {
            const res = await fetch(`/api/v1/shorts/${commentsShortId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: text }),
            });
            const data = await res.json();
            if (data.comment) {
                setComments((prev) => [...prev, data.comment]);
                // bump comment count
                setShorts((prev) =>
                    prev.map((s) =>
                        s.id === commentsShortId ? { ...s, commentCount: s.commentCount + 1 } : s
                    )
                );
            }
        } catch {}
        finally { setPostingComment(false); }
    };

    const handleCommentKey = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitComment(); }
    };

    // ── After upload ──
    const handleUploadSuccess = (newShort: ShortType) => {
        setShorts((prev) => [newShort, ...prev]);
        setShowUpload(false);
    };

    if (isPending) return <Loading />;
    if (!session) return <Login />;

    return (
        <main className="h-screen w-full flex justify-center bg-background overflow-hidden">
            <div className="flex w-full max-w-[1200px] h-full">

                {/* Sidebar */}
                <div className="shrink-0 h-full px-4">
                    <Sidebar session={session} />
                </div>

                {/* Feed + comments container */}
                <div className="flex-1 min-w-0 h-full relative">

                    {/* Video feed */}
                    <div
                        ref={feedRef}
                        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
                    >
                        {loading && (
                            <div className="h-screen flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={32} />
                            </div>
                        )}

                        {!loading && error && (
                            <div className="h-screen flex flex-col items-center justify-center gap-3 text-center px-8">
                                <AlertCircle size={40} className="text-red-500" />
                                <p className="font-semibold text-primary">Could not load shorts</p>
                                <p className="text-sm text-muted-foreground">{error}</p>
                                <button
                                    onClick={() => { setError(null); setLoading(true); fetchShorts().then(({ shorts: s, nextCursor: nc }) => { setShorts(s); setNextCursor(nc); }).catch((e) => setError(e.message)).finally(() => setLoading(false)); }}
                                    className="px-4 py-2 bg-primary text-background rounded-lg text-sm font-bold hover:bg-primary/90 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!loading && !error && shorts.length === 0 && (
                            <div className="h-screen flex flex-col items-center justify-center gap-5 text-center px-8">
                                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Clapperboard size={36} className="text-primary" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-primary">No shorts yet</p>
                                    <p className="text-sm text-muted-foreground mt-1.5">Be the first to post one!</p>
                                </div>
                                <button
                                    onClick={() => setShowUpload(true)}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-background rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                                >
                                    <Upload size={16} />
                                    Post a Short
                                </button>
                            </div>
                        )}

                        {!loading && !error && shorts.map((short, idx) => (
                            <div
                                key={short.id}
                                ref={(el) => { itemRefs.current[idx] = el; }}
                                className="snap-start flex-shrink-0 h-screen w-full flex items-center justify-center py-4"
                            >
                                {/* Phone-aspect container */}
                                <div className="h-[calc(100vh-2rem)] aspect-[9/16] max-w-full rounded-2xl overflow-hidden shadow-2xl relative">
                                    <Short
                                        id={short.id}
                                        videoUrl={short.url}
                                        name={short.author.name}
                                        handle={short.author.handle}
                                        description={short.description}
                                        avatarUrl={short.author.image}
                                        verified={short.author.verified}
                                        likeCount={short.likeCount}
                                        hasLiked={short.hasLiked}
                                        onLike={() => handleLike(short.id)}
                                        commentCount={short.commentCount}
                                        onCommentClick={() => openComments(short.id)}
                                        isOwn={short.isOwn}
                                        onDelete={() => handleDelete(short.id)}
                                        active={idx === activeIndex}
                                    />
                                </div>
                            </div>
                        ))}

                        {loadingMore && (
                            <div className="snap-start h-screen flex items-center justify-center">
                                <Loader2 className="animate-spin text-primary" size={28} />
                            </div>
                        )}
                    </div>

                    {/* Comments panel — slides up from bottom of the feed area */}
                    {commentsShortId && (
                        <CommentsPanel
                            comments={comments}
                            loading={commentsLoading}
                            hasMore={!!commentsCursor}
                            onLoadMore={loadMoreComments}
                            commentInput={commentInput}
                            onInputChange={setCommentInput}
                            onSubmit={submitComment}
                            onKeyDown={handleCommentKey}
                            posting={postingComment}
                            onClose={closeComments}
                            session={session}
                        />
                    )}
                </div>

                {/* Right panel */}
                <div className="hidden xl:flex w-64 shrink-0 flex-col gap-4 py-8 px-2">
                    <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-background rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                    >
                        <Plus size={17} strokeWidth={3} />
                        Post a Short
                    </button>

                    <div className="rounded-xl border border-border bg-[var(--lynt)] p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Clapperboard size={15} className="text-primary" />
                            <h3 className="text-sm font-bold text-primary">Shorts</h3>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            Short-form videos from the Quacky community. Scroll to discover more.
                        </p>
                    </div>
                </div>
            </div>

            {/* Upload modal */}
            {showUpload && (
                <UploadModal
                    onClose={() => setShowUpload(false)}
                    onSuccess={handleUploadSuccess}
                />
            )}

            {/* Mobile upload FAB */}
            <button
                onClick={() => setShowUpload(true)}
                className="xl:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-primary text-background shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
                aria-label="Post a Short"
            >
                <Plus size={24} strokeWidth={3} />
            </button>
        </main>
    );
}

// ─────────────────────────────────────────────
// Comments Panel
// ─────────────────────────────────────────────

interface CommentsPanelProps {
    comments: Comment[];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    commentInput: string;
    onInputChange: (v: string) => void;
    onSubmit: () => void;
    onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
    posting: boolean;
    onClose: () => void;
    session: { user: { name: string; image?: string | null; handle: string } };
}

function CommentsPanel({
    comments,
    loading,
    hasMore,
    onLoadMore,
    commentInput,
    onInputChange,
    onSubmit,
    onKeyDown,
    posting,
    onClose,
    session,
}: CommentsPanelProps) {
    return (
        <>
            {/* Backdrop */}
            <div
                className="absolute inset-0 z-30"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="absolute bottom-0 left-0 right-0 z-40 rounded-t-2xl border border-border bg-[var(--background)]/98 backdrop-blur-xl flex flex-col animate-in slide-in-from-bottom duration-300"
                style={{ height: "65%" }}
            >
                {/* Handle + header */}
                <div className="shrink-0 px-5 pt-3 pb-3 border-b border-border">
                    <div className="w-10 h-1 bg-border rounded-full mx-auto mb-3" />
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-primary">
                            {comments.length > 0 ? `${comments.length} comment${comments.length !== 1 ? "s" : ""}` : "Comments"}
                        </h3>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/50 transition-colors text-muted-foreground hover:text-primary"
                        >
                            <X size={17} />
                        </button>
                    </div>
                </div>

                {/* Comment list */}
                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
                    {loading && (
                        <div className="flex justify-center py-8">
                            <Loader2 className="animate-spin text-primary" size={24} />
                        </div>
                    )}

                    {!loading && comments.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 gap-2 text-center">
                            <MessageCircleIcon />
                            <p className="text-sm font-semibold text-primary">No comments yet</p>
                            <p className="text-xs text-muted-foreground">Be the first to leave one!</p>
                        </div>
                    )}

                    {comments.map((c) => (
                        <CommentRow key={c.id} comment={c} />
                    ))}

                    {hasMore && !loading && (
                        <button
                            onClick={onLoadMore}
                            className="w-full py-2 text-xs font-semibold text-primary hover:text-primary/80 flex items-center justify-center gap-1.5 transition-colors"
                        >
                            <ChevronDown size={14} />
                            Load more
                        </button>
                    )}
                </div>

                {/* Input bar */}
                <div className="shrink-0 px-4 py-3 border-t border-border flex items-center gap-3">
                    <Avatar className="w-8 h-8 shrink-0">
                        <AvatarImage src={session.user.image ?? ""} />
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                            {session.user.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 flex items-center gap-2 rounded-full bg-[var(--lynt)] border border-border px-4 py-2">
                        <input
                            value={commentInput}
                            onChange={(e) => onInputChange(e.target.value)}
                            onKeyDown={onKeyDown}
                            placeholder="Add a comment..."
                            maxLength={280}
                            className="flex-1 bg-transparent text-sm text-primary placeholder:text-muted-foreground outline-none min-w-0"
                            autoFocus
                        />
                        <button
                            onClick={onSubmit}
                            disabled={!commentInput.trim() || posting}
                            className="shrink-0 text-primary disabled:text-muted-foreground hover:text-primary/70 transition-colors disabled:cursor-not-allowed"
                            aria-label="Post comment"
                        >
                            {posting
                                ? <Loader2 size={17} className="animate-spin" />
                                : <Send size={17} strokeWidth={2.5} />
                            }
                        </button>
                    </div>
                </div>
            </div>
        </>
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
        <div className="flex gap-3 py-2.5 items-start">
            <Link href={`/${comment.author.handle}`}>
                <Avatar className="w-8 h-8 shrink-0">
                    <AvatarImage src={comment.author.image ?? ""} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                        {comment.author.name.charAt(0)}
                    </AvatarFallback>
                </Avatar>
            </Link>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                    <Link href={`/${comment.author.handle}`} className="text-xs font-bold text-primary hover:underline">
                        {comment.author.name}
                    </Link>
                    {comment.author.verified && (
                        <BadgeCheck size={12} className="text-primary shrink-0" fill="currentColor" stroke="var(--background)" />
                    )}
                    <span className="text-[10px] text-muted-foreground">
                        {formatTimestamp(comment.createdAt)}
                    </span>
                </div>
                <p className="text-sm text-primary mt-0.5 leading-relaxed break-words">{comment.content}</p>
            </div>

            {/* Like comment */}
            <button
                onClick={toggleLike}
                className="shrink-0 flex flex-col items-center gap-0.5 pt-1 ml-2"
            >
                <Heart
                    size={14}
                    className={liked ? "text-red-500" : "text-muted-foreground hover:text-primary transition-colors"}
                    fill={liked ? "currentColor" : "none"}
                />
                {count > 0 && (
                    <span className="text-[10px] text-muted-foreground">{count}</span>
                )}
            </button>
        </div>
    );
}

function MessageCircleIcon() {
    return (
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
        </div>
    );
}

// ─────────────────────────────────────────────
// Upload Modal
// ─────────────────────────────────────────────

interface UploadModalProps {
    onClose: () => void;
    onSuccess: (short: ShortType) => void;
}

function UploadModal({ onClose, onSuccess }: UploadModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [description, setDescription] = useState("");
    const [uploading, setUploading] = useState(false);
    const [stage, setStage] = useState<"idle" | "uploading" | "creating">("idle");
    const [error, setError] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const pickFile = (f: File) => {
        if (!f.type.startsWith("video/")) { setError("Please select a video file."); return; }
        if (f.size > 50 * 1024 * 1024) { setError("Video must be under 50 MB."); return; }
        setError(null);
        setFile(f);
        setPreview(URL.createObjectURL(f));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) pickFile(f);
    };

    const handleSubmit = async () => {
        if (!file) return;
        setUploading(true);
        setError(null);

        try {
            setStage("uploading");
            const form = new FormData();
            form.append("file", file);
            form.append("existingCount", "0");

            const uploadRes = await fetch("/api/v1/posts/upload", { method: "POST", body: form });
            const uploadData = await uploadRes.json();
            if (!uploadRes.ok || !uploadData.success) throw new Error(uploadData.error ?? "Upload failed");

            const { key, url, name, size } = uploadData.attachment;

            setStage("creating");
            const createRes = await fetch("/api/v1/shorts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ videoKey: key, videoUrl: url, videoName: name, videoSize: size, description: description.trim() }),
            });
            const createData = await createRes.json();
            if (!createRes.ok || !createData.success) throw new Error(createData.error ?? "Could not create short");

            const shortRes = await fetch(`/api/v1/shorts/${createData.short.id}`);
            const shortData = await shortRes.json();
            if (shortRes.ok && shortData.short) {
                onSuccess(shortData.short);
            } else {
                onClose();
            }
        } catch (err: any) {
            setError(err.message ?? "Something went wrong");
            setStage("idle");
        } finally {
            setUploading(false);
        }
    };

    const charsLeft = 500 - description.length;

    return (
        <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 sm:p-6"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-[var(--background)] border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <Clapperboard size={16} className="text-primary" />
                        </div>
                        <h2 className="font-bold text-base text-primary">Post a Short</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-accent/50 text-muted-foreground hover:text-primary transition-colors"
                    >
                        <X size={17} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">

                    {/* Video drop zone or preview */}
                    {!file ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => inputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
                                dragOver
                                    ? "border-primary bg-primary/10 scale-[0.99]"
                                    : "border-border hover:border-primary/50 hover:bg-primary/5"
                            }`}
                        >
                            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                                <Upload size={26} className="text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-primary text-sm">
                                    {dragOver ? "Drop it!" : "Choose a video"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Drag & drop or click to browse · MP4 or WebM · up to 50 MB
                                </p>
                            </div>
                            <input
                                ref={inputRef}
                                type="file"
                                accept="video/mp4,video/webm,video/*"
                                className="hidden"
                                onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
                            />
                        </div>
                    ) : (
                        <div className="relative rounded-2xl overflow-hidden bg-black" style={{ aspectRatio: "9/16", maxHeight: 280 }}>
                            <video
                                src={preview ?? undefined}
                                className="absolute inset-0 w-full h-full object-contain"
                                controls
                                muted
                            />
                            <button
                                onClick={() => { setFile(null); setPreview(null); }}
                                className="absolute top-2.5 right-2.5 w-7 h-7 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors backdrop-blur-sm"
                            >
                                <X size={14} />
                            </button>
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                <p className="text-white text-xs font-medium truncate">{file.name}</p>
                                <p className="text-white/60 text-[10px]">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                            </div>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="text-xs font-semibold text-primary mb-1.5 block">
                            Description
                            <span className="text-muted-foreground font-normal ml-1">(optional)</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What's this short about?"
                            maxLength={500}
                            rows={3}
                            className="w-full rounded-xl border border-border bg-[var(--lynt)] px-3.5 py-2.5 text-sm text-primary outline-none placeholder:text-muted-foreground resize-none focus:border-primary/50 transition-colors"
                        />
                        <div className={`text-right text-[10px] font-semibold mt-1 ${charsLeft < 50 ? (charsLeft < 0 ? "text-red-500" : "text-amber-500") : "text-muted-foreground"}`}>
                            {charsLeft} left
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="flex items-start gap-2.5 rounded-xl bg-red-500/10 border border-red-500/25 px-4 py-3">
                            <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-red-500">{error}</p>
                        </div>
                    )}

                    {/* Upload progress */}
                    {uploading && (
                        <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/20 px-4 py-3">
                            <Loader2 size={16} className="text-primary animate-spin shrink-0" />
                            <div>
                                <p className="text-sm font-semibold text-primary">
                                    {stage === "uploading" ? "Uploading video…" : "Almost done…"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {stage === "uploading" ? "Sending to storage" : "Saving your short"}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 px-5 pb-5 pt-3 border-t border-border">
                    <button
                        onClick={handleSubmit}
                        disabled={!file || uploading || description.length > 500}
                        className="w-full py-3 bg-primary text-background font-bold text-sm rounded-xl hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                        {uploading ? (
                            <><Loader2 size={16} className="animate-spin" />Posting…</>
                        ) : (
                            <><Upload size={16} />Post Short</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

