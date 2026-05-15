// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/client/auth";
import { useEffect, useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
    BadgeCheck, MoreHorizontal, Pin, Lock, Heart, Repeat2,
    Share2, Copy, MessagesSquare, EyeOff, Quote as QuoteIcon,
    Bookmark, BarChart2, CheckCircle2, PencilLine
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReportAbuse } from "@/components/quacky/report";

import { formatSize, formatTimestamp } from "@/client/utils";
import { Post } from "@/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface UserCardData {
    name: string;
    handle: string;
    image: string | null;
    bio?: string | null;
    verified: boolean;
    followers: number;
    following: number;
}

/** @username mention with a Twitter-style hover user card. */
function MentionLink({ handle }: { handle: string }) {
    const router = useRouter();
    const [userData, setUserData] = useState<UserCardData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const hasFetched = useRef(false);

    const fetchUser = async () => {
        if (hasFetched.current) return;
        hasFetched.current = true;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/v1/users/${handle}/card`);
            if (res.ok) setUserData(await res.json());
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <HoverCard openDelay={300} closeDelay={150}>
            <HoverCardTrigger asChild>
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/${handle}`);
                    }}
                    onMouseEnter={fetchUser}
                    onPointerEnter={fetchUser}
                    className="text-primary font-semibold hover:underline"
                >
                    @{handle}
                </button>
            </HoverCardTrigger>
            <HoverCardContent
                className="w-72 p-4"
                onClick={(e) => e.stopPropagation()}
            >
                {isLoading || !userData ? (
                    <div className="flex items-start gap-3">
                        <Skeleton className="w-12 h-12 rounded-full shrink-0" />
                        <div className="flex flex-col gap-2 flex-1 pt-1">
                            <Skeleton className="w-28 h-4 rounded" />
                            <Skeleton className="w-20 h-3 rounded" />
                            <Skeleton className="w-full h-3 rounded" />
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="flex items-start justify-between gap-2">
                            <Avatar className="w-12 h-12 shrink-0">
                                <AvatarImage src={userData.image || ""} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                    {userData.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <Link
                                href={`/${handle}`}
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 px-3 py-1 rounded-full border-2 border-primary text-primary text-xs font-bold hover:bg-primary hover:text-[var(--lynt)] transition"
                            >
                                View Profile
                            </Link>
                        </div>

                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1">
                                <span className="font-bold text-primary leading-tight">{userData.name}</span>
                                {userData.verified && (
                                    <BadgeCheck
                                        className="text-primary shrink-0"
                                        size={15}
                                        fill="currentColor"
                                        stroke="var(--lynt)"
                                    />
                                )}
                            </div>
                            <span className="text-muted-foreground text-sm">@{userData.handle}</span>
                        </div>

                        {userData.bio && (
                            <p className="text-sm text-primary/90 leading-relaxed line-clamp-3">{userData.bio}</p>
                        )}

                        <div className="flex gap-4 text-sm">
                            <span>
                                <strong className="text-primary">{userData.followers}</strong>{" "}
                                <span className="text-muted-foreground">Followers</span>
                            </span>
                            <span>
                                <strong className="text-primary">{userData.following}</strong>{" "}
                                <span className="text-muted-foreground">Following</span>
                            </span>
                        </div>
                    </div>
                )}
            </HoverCardContent>
        </HoverCard>
    );
}

type MarkdownNode = {
    type: string;
    value?: string;
    url?: string;
    children?: MarkdownNode[];
    [key: string]: any;
};

function splitMarkdownText(text: string): MarkdownNode[] {
    const parts = text.split(/(#[\w][\w-]*|@[\w]+|https?:\/\/[^\s]+)/g);

    const nodes: MarkdownNode[] = [];

    for (const part of parts) {
        if (!part) continue;
        if (part.startsWith("#")) {
            nodes.push({
                type: "link",
                url: `/hashtag/${part.slice(1).toLowerCase()}`,
                children: [{ type: "text", value: part }],
            });
            continue;
        }
        if (part.startsWith("@")) {
            nodes.push({
                type: "link",
                url: `/${part.slice(1)}?mention=1`,
                children: [{ type: "text", value: part }],
            });
            continue;
        }
        if (part.match(/^https?:\/\/[^\s]+/)) {
            nodes.push({
                type: "link",
                url: part,
                children: [{ type: "text", value: part }],
            });
            continue;
        }

        nodes.push({ type: "text", value: part });
    }

    return nodes;
}

function remarkPostLinks() {
    return (tree: MarkdownNode) => {
        const walk = (node: MarkdownNode) => {
            if (!node.children) return;

            if (node.type === "link" || node.type === "linkReference" || node.type === "inlineCode" || node.type === "code" || node.type === "html" || node.type === "image" || node.type === "imageReference") {
                return;
            }

            const nextChildren: MarkdownNode[] = [];

            for (const child of node.children) {
                if (child.type === "text" && typeof child.value === "string") {
                    nextChildren.push(...splitMarkdownText(child.value));
                    continue;
                }

                walk(child);
                nextChildren.push(child);
            }

            node.children = nextChildren;
        };

        walk(tree);
    };
}

/** Render markdown while preserving #hashtags, @mentions, and URLs as interactive elements. */
function RichContent({ text, className }: { text: string; className?: string }) {
    return (
        <div className={className}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkPostLinks]}
                components={{
                    h1: ({ node, ...props }) => <h1 className="mt-3 mb-2 text-2xl font-extrabold tracking-tight text-primary" {...props} />,
                    h2: ({ node, ...props }) => <h2 className="mt-3 mb-2 text-xl font-bold tracking-tight text-primary" {...props} />,
                    h3: ({ node, ...props }) => <h3 className="mt-2 mb-1 text-lg font-semibold tracking-tight text-primary" {...props} />,
                    h4: ({ node, ...props }) => <h4 className="mt-2 mb-1 text-base font-semibold text-primary" {...props} />,
                    p: ({ node, ...props }) => <p className="my-0 leading-relaxed" {...props} />,
                    a: ({ node, href, children, ...props }: any) => {
                        if (typeof href === "string" && href.includes("?mention=1")) {
                            return <MentionLink handle={href.split("?")[0].replace(/^\//, "")} />;
                        }
                        if (typeof href === "string" && href.startsWith("/hashtag/")) {
                            const tag = href.slice("/hashtag/".length);
                            return (
                                <Link
                                    href={`/hashtag/${tag}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-primary font-semibold hover:underline"
                                >
                                    {children}
                                </Link>
                            );
                        }
                        return (
                            <a
                                href={href}
                                onClick={(e) => e.stopPropagation()}
                                target={typeof href === "string" && href.startsWith("http") ? "_blank" : undefined}
                                rel={typeof href === "string" && href.startsWith("http") ? "noopener noreferrer" : undefined}
                                className="text-primary font-semibold hover:underline"
                                {...props}
                            >
                                {children}
                            </a>
                        );
                    },
                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1 my-2" {...props} />,
                    ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1 my-2" {...props} />,
                    li: ({ node, ...props }) => <li className="leading-relaxed" {...props} />,
                    strong: ({ node, ...props }) => <strong className="font-semibold text-primary" {...props} />,
                    em: ({ node, ...props }) => <em className="italic text-primary/90" {...props} />,
                    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-primary/70 pl-3 italic text-muted-foreground my-2" {...props} />,
                    code: ({ node, className, ...props }: any) => (
                        className ? (
                            <code className="block rounded-lg bg-background/60 p-3 overflow-x-auto text-sm font-mono my-2 whitespace-pre" {...props} />
                        ) : (
                            <code className="rounded bg-background/60 px-1.5 py-0.5 text-sm font-mono" {...props} />
                        )
                    ),
                    pre: ({ node, ...props }) => <pre className="my-2 overflow-x-auto rounded-lg bg-background/60" {...props} />,
                    hr: ({ node, ...props }) => <hr className="my-3 border-border" {...props} />,
                }}
            >
                {text}
            </ReactMarkdown>
        </div>
    );
}

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
    return String(n);
}

// ─── Action Button ────────────────────────────────────────────────────────────

function Action({
    icon,
    count,
    onClick,
    active,
    activeClassName = "border-primary bg-primary text-[var(--lynt)]",
    defaultClassName = "border-primary text-primary hover:bg-primary",
    hoverTextClassName = "group-hover:text-[var(--lynt)]",
}: {
    icon: React.ReactNode;
    count: number;
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    active?: boolean;
    activeClassName?: string;
    defaultClassName?: string;
    hoverTextClassName?: string;
}) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
            className={`cursor-pointer group flex items-center gap-1 px-2 py-1 rounded-lg border-2 transition ${active ? activeClassName : defaultClassName}`}
        >
            <span className={`[&>svg]:stroke-[3px] transition ${active ? "" : hoverTextClassName}`}>{icon}</span>
            <span className={`font-medium transition text-sm ${active ? "" : hoverTextClassName}`}>{formatCount(count)}</span>
        </button>
    );
}

// ─── Embedded post preview (shown inside quote cards) ────────────────────────

function EmbeddedPost({ post }: { post: Post }) {
    const router = useRouter();

    if (post.isDeleted || post.isHidden) {
        return (
            <div className="rounded-lg border border-border bg-background/40 p-3 text-sm text-muted-foreground italic">
                This post is unavailable.
            </div>
        );
    }

    return (
        <div
            onClick={(e) => { e.stopPropagation(); router.push(`/post/${post.id}`); }}
            className="cursor-pointer rounded-lg border border-border bg-background/40 p-3 flex flex-col gap-1.5 hover:bg-background/60 transition"
        >
            {/* Author line */}
            <div className="flex items-center gap-1.5">
                <Avatar className="w-4 h-4 shrink-0">
                    <AvatarImage src={post.author.image || ""} />
                    <AvatarFallback className="text-[8px] bg-primary/10">{post.author.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <span className="font-bold text-sm text-primary truncate">{post.author.name}</span>
                {post.author.verified && (
                    <BadgeCheck className="text-primary shrink-0" size={13} fill="currentColor" stroke="var(--lynt)" />
                )}
                <span className="text-muted-foreground text-xs font-medium truncate">@{post.author.handle}</span>
                <span className="text-muted-foreground text-xs ml-auto shrink-0 flex items-center gap-1">
                    <span>{formatTimestamp(post.createdAt)}</span>
                    {post.editedAt && (
                        <span className="rounded-full border border-border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                            Edited
                        </span>
                    )}
                </span>
            </div>

            {/* Content */}
            {post.content && (
                <RichContent text={post.content} className="text-sm whitespace-pre-wrap line-clamp-3 text-primary/90" />
            )}

            {/* Attachments hint */}
            {post.attachments && post.attachments.length > 0 && (
                <p className="text-xs text-muted-foreground">
                    📎 {post.attachments.length} attachment{post.attachments.length > 1 ? "s" : ""}
                </p>
            )}
        </div>
    );
}

// ─── Poll Block ───────────────────────────────────────────────────────────────

function PollBlock({
    postId,
    poll,
    initialVoteCounts,
    initialUserVote,
    isAuthor,
    session,
}: {
    postId: string;
    poll: { options: string[] };
    initialVoteCounts: number[];
    initialUserVote: number | null;
    isAuthor: boolean;
    session: any;
}) {
    const [voteCounts, setVoteCounts] = useState<number[]>(initialVoteCounts);
    const [userVote, setUserVote] = useState<number | null>(initialUserVote);
    const [isVoting, setIsVoting] = useState(false);

    const hasVoted = userVote !== null;
    const showResults = hasVoted || isAuthor;
    const totalVotes = voteCounts.reduce((a, b) => a + b, 0);

    async function castVote(optionIndex: number) {
        if (!session || isVoting) return;
        if (userVote === optionIndex) return; // already voted for this option

        const prevVote = userVote;
        const prevCounts = [...voteCounts];

        // Optimistic update
        const next = [...voteCounts];
        if (prevVote !== null) next[prevVote] = Math.max(0, next[prevVote] - 1);
        next[optionIndex] = next[optionIndex] + 1;
        setVoteCounts(next);
        setUserVote(optionIndex);
        setIsVoting(true);

        try {
            const res = await fetch(`/api/v1/posts/${postId}/vote`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ optionIndex }),
            });
            if (res.ok) {
                const data = await res.json();
                setVoteCounts(data.pollVoteCounts);
                setUserVote(data.userVote);
            } else {
                // Revert on error
                setVoteCounts(prevCounts);
                setUserVote(prevVote);
            }
        } catch {
            setVoteCounts(prevCounts);
            setUserVote(prevVote);
        } finally {
            setIsVoting(false);
        }
    }

    return (
        <div
            className="flex flex-col gap-2 mt-1"
            onClick={(e) => e.stopPropagation()}
        >
            {poll.options.map((option, i) => {
                const count = voteCounts[i] ?? 0;
                const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                const isSelected = userVote === i;

                if (showResults) {
                    return (
                        <button
                            key={i}
                            type="button"
                            disabled={isVoting || !session}
                            onClick={() => castVote(i)}
                            className={`relative w-full rounded-lg border-2 overflow-hidden text-left transition ${
                                isSelected
                                    ? "border-primary"
                                    : "border-border hover:border-primary/50"
                            } ${isVoting ? "cursor-wait" : "cursor-pointer"}`}
                        >
                            {/* Progress bar fill */}
                            <div
                                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                                    isSelected ? "bg-primary/20" : "bg-primary/8"
                                }`}
                                style={{ width: `${pct}%` }}
                            />
                            <div className="relative flex items-center justify-between px-3 py-2 gap-2">
                                <div className="flex items-center gap-2 min-w-0">
                                    {isSelected && (
                                        <CheckCircle2 size={14} className="text-primary shrink-0" fill="currentColor" stroke="var(--lynt)" />
                                    )}
                                    <span className={`text-sm font-medium truncate ${isSelected ? "text-primary font-semibold" : "text-primary/90"}`}>
                                        {option}
                                    </span>
                                </div>
                                <span className="text-xs font-bold text-primary shrink-0">{pct}%</span>
                            </div>
                        </button>
                    );
                }

                return (
                    <button
                        key={i}
                        type="button"
                        disabled={isVoting || !session}
                        onClick={() => castVote(i)}
                        className="w-full rounded-lg border-2 border-primary text-primary font-semibold py-2 px-3 text-sm text-left hover:bg-primary hover:text-[var(--lynt)] transition disabled:opacity-50"
                    >
                        {option}
                    </button>
                );
            })}
            <p className="text-xs text-muted-foreground">
                {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
                {!session && " · Sign in to vote"}
            </p>
        </div>
    );
}

// ─── Post Skeleton ────────────────────────────────────────────────────────────

function PostCardSkeleton() {
    return (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                <div className="flex items-center gap-2 flex-1">
                    <Skeleton className="h-4 w-24 rounded" />
                    <Skeleton className="h-3 w-16 rounded" />
                </div>
                <Skeleton className="h-3 w-10 rounded ml-auto" />
            </div>
            <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-full rounded" />
                <Skeleton className="h-3.5 w-5/6 rounded" />
                <Skeleton className="h-3.5 w-3/4 rounded" />
            </div>
            <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-8 w-14 rounded-lg" />
                    <Skeleton className="h-8 w-14 rounded-lg" />
                    <Skeleton className="h-8 w-14 rounded-lg" />
                </div>
                <div className="flex items-center gap-1.5">
                    <Skeleton className="h-8 w-14 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                </div>
            </div>
        </div>
    );
}

export function PostsSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div className="w-full flex flex-col gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <PostCardSkeleton key={i} />
            ))}
        </div>
    );
}

// ─── Posts list ───────────────────────────────────────────────────────────────

interface Props {
    posts: Post[];
    showActions?: boolean;
    onChanged?: () => void;
}

export default function Posts({ posts, showActions = true, onChanged }: Props) {
    const router = useRouter();
    const { data: session } = authClient.useSession();

    function sort(posts: Post[]) {
        return [...posts].sort((a, b) => {
            if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }

    if (posts.length === 0) {
        return (
            <div className="p-6 w-full flex items-center justify-center">
                <div className="flex flex-col items-center text-center">
                    <h3 className="text-lg font-semibold text-primary">No posts to show</h3>
                    <p className="text-sm text-muted-foreground mt-1">In the meantime, here is a picture of a bird.</p>
                    <img src="/assets/logo/sleepy.png" alt="No posts" className="w-48 h-48 object-contain mx-auto mt-3" />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-2">
            {sort(posts).map((post) => (
                <PostCard key={post.id} post={post} session={session} router={router} showActions={showActions} onChanged={onChanged} />
            ))}
        </div>
    );
}

// ─── Post Card ────────────────────────────────────────────────────────────────

export function PostCard({
    post,
    session,
    router,
    showActions = true,
    onChanged,
}: {
    post: Post;
    session: any;
    router: any;
    showActions?: boolean;
    onChanged?: () => void;
}) {
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isQuoteOpen, setIsQuoteOpen] = useState(false);
    const [editContent, setEditContent] = useState("");
    const [quoteContent, setQuoteContent] = useState("");
    const [isSavingEdit, setIsSavingEdit] = useState(false);
    const [isQuoting, setIsQuoting] = useState(false);

    const [isPinned, setIsPinned] = useState(post.pinned);
    const [isHidden, setIsHidden] = useState(post.isHidden);
    const [isReadOnly, setIsReadOnly] = useState(post.readOnly);
    const [isDeleted, setIsDeleted] = useState(post.isDeleted);
    const [isModerating, setIsModerating] = useState(false);

    // For reposts, all actions (like, repost, quote, share) target the original post
    const isRepost = post.type === "repost";
    const targetId = isRepost && post.parent ? post.parent.id : post.id;

    // The post whose content/author we display
    const displayPost = isRepost ? (post.parent ?? null) : post;

    const [currentContent, setCurrentContent] = useState(displayPost?.content ?? "");
    const [currentEditedAt, setCurrentEditedAt] = useState<string | Date | null>(displayPost?.editedAt ?? null);

    useEffect(() => {
        if (!displayPost) return;
        setCurrentContent(displayPost.content ?? "");
        setCurrentEditedAt(displayPost.editedAt ?? null);
    }, [displayPost?.id, displayPost?.content, displayPost?.editedAt]);

    const [hasLiked, setHasLiked] = useState(
        post.hasLiked ?? post.likes?.some((l) => l.userId === session?.user?.id) ?? false
    );
    const [likeCount, setLikeCount] = useState(post.likes?.length ?? 0);
    const [hasReposted, setHasReposted] = useState(post.hasReposted ?? false);
    const [repostCount, setRepostCount] = useState(post.repostCount ?? 0);
    const [hasBookmarked, setHasBookmarked] = useState(post.hasBookmarked ?? false);

    const replyCount = post.replyCount ?? post.children?.filter((c) => c.type === "reply").length ?? 0;
    const viewCount = (displayPost as any)?.viewCount ?? post.viewCount ?? 0;
    const renderPost = displayPost ? { ...displayPost, content: currentContent, editedAt: currentEditedAt } : null;
    const canManagePost = !!session && (session.user?.role === "Admin" || session.user?.id === post.author.id);
    const canEditPost = !!renderPost && canManagePost && post.type !== "repost";

    if (isDeleted) return null;

    // ── Actions ───────────────────────────────────────────────────────────────

    async function toggleLike() {
        if (!session) { router.push("/login"); return; }
        const next = !hasLiked;
        setHasLiked(next);
        setLikeCount((c) => c + (next ? 1 : -1));
        const res = await fetch(`/api/v1/posts/${targetId}/like`, { method: "POST" });
        if (!res.ok) { setHasLiked(!next); setLikeCount((c) => c + (next ? -1 : 1)); }
    }

    async function toggleRepost() {
        if (!session) { router.push("/login"); return; }
        const next = !hasReposted;
        setHasReposted(next);
        setRepostCount((c) => c + (next ? 1 : -1));
        const res = await fetch(`/api/v1/posts/${targetId}/repost`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: "{}",
        });
        if (!res.ok) { setHasReposted(!next); setRepostCount((c) => c + (next ? -1 : 1)); }
    }

    async function submitQuote() {
        if (!quoteContent.trim() || isQuoting) return;
        setIsQuoting(true);
        try {
            const res = await fetch(`/api/v1/posts/${targetId}/repost`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quote: true, content: quoteContent.trim() }),
            });
            if (res.ok) {
                setQuoteContent("");
                setIsQuoteOpen(false);
            }
        } finally {
            setIsQuoting(false);
        }
    }

    async function toggleBookmark() {
        if (!session) { router.push("/login"); return; }
        const next = !hasBookmarked;
        setHasBookmarked(next);
        const res = await fetch(`/api/v1/posts/${targetId}/bookmark`, { method: "POST" });
        if (!res.ok) setHasBookmarked(!next);
    }

    async function report(type: string, reason: string) {
        fetch(`/api/v1/posts/${post.id}/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type, reason }),
        });
    }

    async function saveEdit() {
        if (!renderPost || isSavingEdit) return;

        const nextContent = editContent.trim();
        if (!nextContent && !renderPost.attachments?.length && !renderPost.poll) return;

        setIsSavingEdit(true);
        try {
            const res = await fetch(`/api/v1/posts/${post.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: nextContent }),
            });

            if (!res.ok) return;

            const data = await res.json().catch(() => null);
            setCurrentContent(nextContent);
            setCurrentEditedAt(data?.post?.editedAt ?? new Date().toISOString());
            setIsEditOpen(false);
            onChanged?.();
        } finally {
            setIsSavingEdit(false);
        }
    }

    async function deletePost() {
        if (!canManagePost || isModerating) return;

        setIsModerating(true);
        try {
            const res = await fetch(`/api/v1/posts/${post.id}/delete`, { method: "POST" });
            if (!res.ok) return;

            setIsDeleted(true);
            onChanged?.();

            if (typeof window !== "undefined" && window.location.pathname.startsWith("/post/")) {
                window.location.reload();
            }
        } finally {
            setIsModerating(false);
        }
    }

    async function moderate(action: "pin" | "unpin" | "list" | "unlist" | "readonly" | "unreadonly") {
        if (!session || session.user?.role !== "Admin" || isModerating) return;
        setIsModerating(true);
        try {
            const res = await fetch(`/api/v1/posts/${post.id}/${action}`, { method: "POST" });
            if (!res.ok) return;
            if (action === "pin") setIsPinned(true);
            if (action === "unpin") setIsPinned(false);
            if (action === "list") setIsHidden(false);
            if (action === "unlist") setIsHidden(true);
            if (action === "readonly") setIsReadOnly(true);
            if (action === "unreadonly") setIsReadOnly(false);
        } finally {
            setIsModerating(false);
        }
    }

    const navigateToPost = () => router.push(`/post/${targetId}`);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2">

            {post.type === "repost" && (
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-semibold">
                    <Repeat2 size={13} className="text-primary" />
                    <Link
                        href={`/${post.author.handle}`}
                        className="text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {post.author.name}
                    </Link>
                    <span>reposted</span>
                </div>
            )}

            {isPinned && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Pin fill="currentColor" size={15} className="text-primary" />
                    <span className="font-bold text-xs">Pinned by an admin</span>
                </div>
            )}

            {isRepost && !displayPost && (
                <div className="text-sm text-muted-foreground italic py-2">
                    The original post is unavailable.
                </div>
            )}

            {displayPost && (
                <>
                    <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8 shrink-0">
                            <AvatarImage src={displayPost.author.image || ""} />
                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
                                {displayPost.author.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>

                        <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <Link
                                href={`/${displayPost.author.handle}`}
                                className="font-bold text-primary hover:underline truncate"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {displayPost.author.name}
                            </Link>

                            {displayPost.author.verified && (
                                <BadgeCheck
                                    className="text-primary shrink-0"
                                    size={18}
                                    fill="currentColor"
                                    stroke="var(--lynt)"
                                />
                            )}

                            <span className="text-muted-foreground text-sm font-medium truncate">
                                @{displayPost.author.handle}
                            </span>

                            <span className="text-muted-foreground text-sm shrink-0 flex items-center gap-1">
                                <span>· {formatTimestamp(renderPost?.createdAt ?? displayPost.createdAt)}</span>
                                {renderPost?.editedAt && (
                                    <span>
                                        · Edited
                                    </span>
                                )}
                            </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 ml-auto">
                            {isReadOnly && (
                                <div className="flex items-center gap-1 text-muted-foreground text-xs border border-border rounded-full px-2 py-0.5">
                                    <Lock size={11} />
                                    <span>Locked</span>
                                </div>
                            )}

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="cursor-pointer p-1.5 rounded-full hover:bg-primary/10 transition text-muted-foreground">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem className="cursor-pointer" onClick={() => setIsReportOpen(true)}>
                                        Report Post
                                    </DropdownMenuItem>
                                    {canEditPost && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                                className="cursor-pointer gap-2"
                                                onClick={() => {
                                                    setEditContent(currentContent);
                                                    setIsEditOpen(true);
                                                }}
                                            >
                                                Edit Post
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                    {canManagePost && (
                                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 gap-2" onClick={deletePost} disabled={isModerating}>
                                            Delete Post
                                        </DropdownMenuItem>
                                    )}
                                    {session?.user?.role === "Admin" && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => moderate(isPinned ? "unpin" : "pin")} disabled={isModerating}>
                                                {isPinned ? "Unpin" : "Pin"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => moderate(isHidden ? "list" : "unlist")} disabled={isModerating}>
                                                {isHidden ? "List Post" : "Unlist"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => moderate(isReadOnly ? "unreadonly" : "readonly")} disabled={isModerating}>
                                                {isReadOnly ? "Unlock Replies" : "Lock Replies"}
                                            </DropdownMenuItem>
                                        </>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>

                    {/* "Replying to" context — shown on reply-type posts */}
                    {post.type === "reply" && post.parent && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1 -mt-0.5">
                            <MessagesSquare size={11} />
                            <span>
                                Replying to{" "}
                                <Link
                                    href={`/${post.parent.author.handle}`}
                                    className="text-primary font-semibold hover:underline"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    @{post.parent.author.handle}
                                </Link>
                            </span>
                        </div>
                    )}

                    {/* Unlisted warning */}
                    {isHidden && (
                        <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                            <EyeOff size={15} className="shrink-0 text-red-700" />
                            <p className="text-sm text-red-700">
                                This post has been unlisted due to a violation of our community guidelines.{" "}
                                <a href="/help/unlisted" className="underline">Learn More</a>
                            </p>
                        </div>
                    )}

                    {/* Content */}
                    {renderPost?.content && (
                        <div
                            onClick={navigateToPost}
                            className="cursor-pointer rounded-md p-1 -mx-1 hover:bg-white/5 transition"
                        >
                            <RichContent text={renderPost.content} className="whitespace-pre-wrap leading-relaxed" />
                        </div>
                    )}

                    {/* Poll */}
                    {renderPost?.poll && (renderPost.poll as any).options && (
                        <PollBlock
                            postId={renderPost.id}
                            poll={renderPost.poll as { options: string[] }}
                            initialVoteCounts={
                                (renderPost as any).pollVoteCounts ??
                                Array((renderPost.poll as any).options.length).fill(0)
                            }
                            initialUserVote={(renderPost as any).userVote ?? null}
                            isAuthor={renderPost.author.id === session?.user?.id}
                            session={session}
                        />
                    )}

                    {/* Quoted post embedded card (only for type="quote") */}
                    {post.type === "quote" && post.parent && (
                        <EmbeddedPost post={post.parent as Post} />
                    )}

                    {/* Attachments */}
                    {renderPost?.attachments && renderPost.attachments.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {renderPost.attachments.map((a) => (
                                <div key={a.key} className="border rounded-lg overflow-hidden">
                                    {a.kind === "image" ? (
                                        <img
                                            src={a.url}
                                            alt=""
                                            className="w-full h-48 object-cover cursor-pointer bg-background/60"
                                            onClick={(e) => { e.stopPropagation(); window.open(a.url, "_blank"); }}
                                        />
                                    ) : a.kind === "video" ? (
                                        <video
                                            src={a.url}
                                            controls
                                            className="w-full h-48 object-cover bg-background/60"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    ) : (
                                        <a
                                            href={a.url}
                                            onClick={(e) => e.stopPropagation()}
                                            className="flex items-center gap-3 border-dashed border p-3 bg-background/60 hover:bg-background/80 transition"
                                        >
                                            <div className="shrink-0 text-2xl">📄</div>
                                            <div className="min-w-0">
                                                <p className="text-primary font-semibold truncate text-sm">{a.name}</p>
                                                <p className="text-xs text-muted-foreground">{formatSize(a.size)}</p>
                                            </div>
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Action bar ─────────────────────────────────────────── */}
                    {showActions && (
                        <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5">

                                {/* Replies */}
                                {!isReadOnly && (
                                    <Action
                                        onClick={navigateToPost}
                                        icon={<MessagesSquare strokeWidth={3} size={16} />}
                                        count={replyCount}
                                        activeClassName="border-primary bg-primary text-[var(--lynt)]"
                                        active={post.hasReplied}
                                    />
                                )}

                                {/* Repost / Quote dropdown */}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            onClick={(e) => e.stopPropagation()}
                                            className={`cursor-pointer group flex items-center gap-1 px-2 py-1 rounded-lg border-2 transition ${
                                                hasReposted
                                                    ? "border-primary bg-primary text-[var(--lynt)]"
                                                    : "border-primary text-primary hover:bg-primary hover:text-[var(--lynt)]"
                                            }`}
                                        >
                                            <Repeat2 strokeWidth={3} size={16} />
                                            <span className="font-medium text-sm">{formatCount(repostCount)}</span>
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                                        <DropdownMenuItem className="cursor-pointer gap-2" onClick={toggleRepost}>
                                            <Repeat2 size={15} />
                                            {hasReposted ? "Undo Repost" : "Repost"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem className="cursor-pointer gap-2" onClick={() => setIsQuoteOpen(true)}>
                                            <QuoteIcon size={15} />
                                            Quote
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>

                                {/* Like */}
                                <Action
                                    icon={<Heart strokeWidth={3} size={16} />}
                                    count={likeCount}
                                    activeClassName="border-primary bg-primary text-[var(--lynt)]"
                                    defaultClassName="border-primary text-primary hover:bg-primary"
                                    hoverTextClassName="group-hover:text-[var(--lynt)]"
                                    onClick={toggleLike}
                                    active={hasLiked}
                                />
                            </div>

                            {/* Views + Bookmark + Share */}
                            <div className="flex items-center gap-1.5">
                                {/* Views (non-interactive) */}
                                <Action
                                    icon={<BarChart2 strokeWidth={3} size={16} />}
                                    count={viewCount}
                                    defaultClassName="border-primary text-primary hover:bg-primary"
                                    hoverTextClassName="group-hover:text-[var(--lynt)]"
                                    onClick={(e) => { e.preventDefault(); }}
                                />

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
                                    className={`cursor-pointer p-1.5 rounded-lg border-2 transition ${
                                        hasBookmarked
                                            ? "border-primary bg-primary text-[var(--lynt)]"
                                            : "border-primary text-primary hover:bg-primary hover:text-[var(--lynt)]"
                                    }`}
                                    title={hasBookmarked ? "Remove bookmark" : "Bookmark"}
                                >
                                    <Bookmark strokeWidth={3} size={16} fill={hasBookmarked ? "currentColor" : "none"} />
                                </button>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="cursor-pointer group flex items-center justify-center p-1.5 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-[var(--lynt)] transition"
                                    >
                                        <Share2 strokeWidth={3} size={16} />
                                    </button>
                                </DialogTrigger>
                                <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Share Post</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            defaultValue={`${typeof window !== "undefined" ? window.location.origin : ""}/post/${targetId}`}
                                            readOnly
                                            className="flex-1"
                                        />
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="px-3 cursor-pointer shrink-0"
                                            onClick={() => {
                                                navigator.clipboard.writeText(
                                                    `${typeof window !== "undefined" ? window.location.origin : ""}/post/${targetId}`
                                                );
                                            }}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* ── Quote compose dialog ──────────────────────────────────────── */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <PencilLine size={18} />
                            Edit Post
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            placeholder="Update your post..."
                            maxLength={400}
                            className="resize-none min-h-[140px]"
                            autoFocus
                        />
                        <div className="flex justify-between items-center gap-3">
                            <span className="text-xs text-muted-foreground">
                                Markdown is supported.
                            </span>
                            <span className={`text-xs font-medium ${editContent.length > 380 ? "text-red-500" : "text-muted-foreground"}`}>
                                {editContent.length}/400
                            </span>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={saveEdit} disabled={isSavingEdit || (!editContent.trim() && !renderPost?.attachments?.length && !renderPost?.poll)} className="font-bold">
                                {isSavingEdit ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isQuoteOpen} onOpenChange={setIsQuoteOpen}>
                <DialogContent onClick={(e) => e.stopPropagation()} className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <QuoteIcon size={18} />
                            Quote Post
                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex flex-col gap-3">
                        <Textarea
                            value={quoteContent}
                            onChange={(e) => setQuoteContent(e.target.value)}
                            placeholder="Add your thoughts..."
                            maxLength={400}
                            className="resize-none min-h-[100px]"
                            autoFocus
                        />
                        <div className="flex justify-end">
                            <span className={`text-xs font-medium ${quoteContent.length > 380 ? "text-red-500" : "text-muted-foreground"}`}>
                                {quoteContent.length}/400
                            </span>
                        </div>
                        {/* Preview of the post being quoted */}
                        {displayPost && <EmbeddedPost post={displayPost as Post} />}
                        <Button
                            onClick={submitQuote}
                            disabled={isQuoting || !quoteContent.trim()}
                            className="w-full font-bold"
                        >
                            {isQuoting ? "Posting..." : "Quote"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <ReportAbuse isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} onSubmit={report} />
        </div>
    );
}
