"use client";

// Libraries
import { authClient } from "@/client/auth";
import { Heart, MessageCircle, Share2, MoreVertical, Volume2, VolumeX, BadgeCheck } from "lucide-react";
import { useState, useRef, useEffect } from "react";

// UI Components
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Types
interface Props {
    videoUrl: string;
    name: string;
    handle: string;
    description: string;
    avatarUrl?: string;
    verified?: boolean;
}

export default function Short({
    videoUrl,
    name,
    handle,
    description,
    avatarUrl,
    verified
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);

    // Handle play/pause on click
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (videoRef.current.paused) {
            videoRef.current.play();
        } else {
            videoRef.current.pause();
        }
    };

    return (
        <div className="relative w-full h-screen bg-[var(--background)] flex items-center justify-center snap-start overflow-hidden rounded-xl border border-white/10">

            <video
                ref={videoRef}
                src={videoUrl}
                className="w-full h-full object-cover cursor-pointer"
                loop
                playsInline
                autoPlay
                onClick={togglePlay}
            />

            <div className="absolute right-4 bottom-0 flex flex-col gap-2 z-20 pb-4">
                <div className="flex flex-col items-center gap-1">
                    <button
                        className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md"
                    >
                        <Heart size={26} className="text-white"/>
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">12.5K</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                        <MessageCircle size={26} className="text-white" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">842</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                        <Share2 size={26} className="text-white" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">Share</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                    <button className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-md">
                        <MoreVertical size={26} className="text-white" />
                    </button>
                    <span className="text-white text-xs font-bold drop-shadow-md">More</span>
                </div>

            </div>

            <div className="absolute bottom-0 left-4 right-20 z-20 flex flex-col gap-3 pb-4">

                <div className="flex items-center gap-3">

                    <Avatar className="w-10 h-10">
                        <AvatarImage src={avatarUrl} />
                        <AvatarFallback className="bg-primary text-white font-bold">
                            {name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-1">
                            <span className="text-white font-bold text-base drop-shadow-md">{name}</span>
                            {verified && (
                                <div className="p-0">
                                    <BadgeCheck
                                        className="text-primary"
                                        size={23}
                                        fill="currentColor"
                                        stroke="var(--background)"
                                    />
                                </div>
                            )}
                        </div>

                        <span className="text-white/80 text-xs font-medium drop-shadow-md">@{handle}</span>
                    </div>

                    <button className="px-4 py-1 bg-white text-black text-xs font-bold rounded-full hover:bg-gray-200 transition">
                        Follow
                    </button>

                </div>

                <p className="text-white text-sm leading-relaxed line-clamp-2 drop-shadow-md">
                    {description}
                </p>

            </div>
        </div>
    );
}
