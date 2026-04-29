"use client";

// Libraries
import Link from "next/link";
import {
    Heart,
    MessageCircle,
    Share2,
    MoreVertical,
    Volume2,
    VolumeX,
    BadgeCheck,
    Trash2,
    Play,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

// UI Components
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
    id: string;
    videoUrl: string;
    name: string;
    handle: string;
    description: string;
    avatarUrl?: string;
    verified?: boolean;
    likeCount: number;
    hasLiked: boolean;
    onLike: () => void;
    commentCount: number;
    onCommentClick: () => void;
    isOwn?: boolean;
    onDelete?: () => void;
    active?: boolean;
}

function formatCount(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
}

export default function Short({
    id,
    videoUrl,
    name,
    handle,
    description,
    avatarUrl,
    verified,
    likeCount,
    hasLiked,
    onLike,
    commentCount,
    onCommentClick,
    isOwn,
    onDelete,
    active = true,
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [muted, setMuted] = useState(true);
    const [paused, setPaused] = useState(false);
    const [showMore, setShowMore] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expandDesc, setExpandDesc] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (active) {
            video.play().catch(() => {});
        } else {
            video.pause();
        }
    }, [active]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play();
        } else {
            video.pause();
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setMuted(video.muted);
    };

    const handleShare = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const url = `${window.location.origin}/short/${id}`;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {}
    };

    return (
        <div className="relative w-full h-full bg-black select-none">

            {/* Video */}
            <video
                ref={videoRef}
                src={videoUrl}
                className="absolute inset-0 w-full h-full object-cover cursor-pointer"
                loop
                playsInline
                muted
                autoPlay
                onClick={togglePlay}
                onPlay={() => setPaused(false)}
                onPause={() => setPaused(true)}
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent pointer-events-none" />

            {/* Paused icon */}
            {paused && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-20 h-20 rounded-full bg-black/40 flex items-center justify-center backdrop-blur-sm">
                        <Play size={36} className="text-white ml-1.5" fill="currentColor" />
                    </div>
                </div>
            )}

            {/* Mute — top right */}
            <button
                onClick={toggleMute}
                className="absolute top-4 right-4 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            >
                {muted
                    ? <VolumeX size={16} className="text-white" />
                    : <Volume2 size={16} className="text-white" />}
            </button>

            {/* Right action bar */}
            <div className="absolute right-3 bottom-24 flex flex-col gap-4 items-center z-20">

                {/* Like */}
                <button
                    onClick={(e) => { e.stopPropagation(); onLike(); }}
                    className="flex flex-col items-center gap-1.5 group"
                >
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-150 group-active:scale-90 ${hasLiked ? "bg-red-500/20" : "bg-white/15 hover:bg-white/25"} backdrop-blur-sm`}>
                        <Heart
                            size={22}
                            className={`transition-colors ${hasLiked ? "text-red-500" : "text-white"}`}
                            fill={hasLiked ? "currentColor" : "none"}
                            strokeWidth={2.5}
                        />
                    </div>
                    <span className="text-white text-[11px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {formatCount(likeCount)}
                    </span>
                </button>

                {/* Comment */}
                <button
                    onClick={(e) => { e.stopPropagation(); onCommentClick(); }}
                    className="flex flex-col items-center gap-1.5 group"
                >
                    <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors group-active:scale-90">
                        <MessageCircle size={22} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-white text-[11px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {formatCount(commentCount)}
                    </span>
                </button>

                {/* Share */}
                <button
                    onClick={handleShare}
                    className="flex flex-col items-center gap-1.5 group"
                >
                    <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors group-active:scale-90">
                        <Share2 size={22} className="text-white" strokeWidth={2.5} />
                    </div>
                    <span className="text-white text-[11px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                        {copied ? "Copied!" : "Share"}
                    </span>
                </button>

                {/* More */}
                <div className="relative">
                    <button
                        onClick={(e) => { e.stopPropagation(); setShowMore((v) => !v); }}
                        className="flex flex-col items-center gap-1.5 group"
                    >
                        <div className="w-11 h-11 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center hover:bg-white/25 transition-colors group-active:scale-90">
                            <MoreVertical size={22} className="text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-white text-[11px] font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">More</span>
                    </button>

                    {showMore && (
                        <div
                            className="absolute right-12 bottom-0 bg-[var(--background)]/95 backdrop-blur-md border border-border rounded-2xl shadow-2xl py-1.5 min-w-[148px] z-30"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {isOwn && onDelete && (
                                <button
                                    onClick={() => { setShowMore(false); onDelete(); }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors rounded-t-xl"
                                >
                                    <Trash2 size={15} />
                                    Delete short
                                </button>
                            )}
                            <button
                                onClick={() => setShowMore(false)}
                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-primary hover:bg-accent/40 transition-colors rounded-b-xl"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom-left: author + description */}
            <div className="absolute bottom-0 left-0 right-16 z-20 px-4 pb-5 flex flex-col gap-3">

                {/* Author row */}
                <div className="flex items-center gap-2.5">
                    <Link href={`/${handle}`} onClick={(e) => e.stopPropagation()} className="shrink-0">
                        <Avatar className="w-10 h-10 ring-2 ring-white/25 hover:ring-white/50 transition-all">
                            <AvatarImage src={avatarUrl} />
                            <AvatarFallback className="bg-primary text-white font-bold text-sm">
                                {name.charAt(0)}
                            </AvatarFallback>
                        </Avatar>
                    </Link>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1">
                            <Link
                                href={`/${handle}`}
                                onClick={(e) => e.stopPropagation()}
                                className="text-white font-bold text-sm leading-tight hover:underline underline-offset-2 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] truncate"
                            >
                                {name}
                            </Link>
                            {verified && (
                                <BadgeCheck
                                    size={16}
                                    className="text-primary shrink-0"
                                    fill="currentColor"
                                    stroke="black"
                                />
                            )}
                        </div>
                        <span className="text-white/70 text-xs leading-tight drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
                            @{handle}
                        </span>
                    </div>
                </div>

                {/* Description */}
                {description && (
                    <div className="max-w-xs">
                        <p
                            className={`text-white text-sm leading-relaxed drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] ${expandDesc ? "" : "line-clamp-2"}`}
                        >
                            {description}
                        </p>
                        {description.length > 80 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setExpandDesc((v) => !v); }}
                                className="text-white/60 text-xs font-semibold mt-0.5 hover:text-white/80 transition-colors"
                            >
                                {expandDesc ? "less" : "more"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
