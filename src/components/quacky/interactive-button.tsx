"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

interface InteractiveButtonProps {
    message: string;
    onClick?: () => void;
    hoverImage: string;
    defaultImage: string;
    imageSize?: number;
    typingSpeed?: number;
    bottomOffset?: string;
    rightOffset?: string;
    bubbleBottomOffset?: string;
    bubbleRightOffset?: string;
    ariaLabel?: string;
}

export function InteractiveButton({
    message,
    onClick,
    hoverImage,
    defaultImage,
    imageSize = 220,
    typingSpeed = 45,
    bottomOffset = "-bottom-10",
    rightOffset = "-right-15",
    bubbleBottomOffset = "bottom-[180px]",
    bubbleRightOffset = "right-[42px]",
    ariaLabel = "Interactive button",
}: InteractiveButtonProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [bubbleText, setBubbleText] = useState("");
    const typingTimer = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (typingTimer.current) clearInterval(typingTimer.current);
        if (isHovered) {
            setBubbleText("");
            let i = 0;
            typingTimer.current = setInterval(() => {
                i++;
                setBubbleText(message.slice(0, i));
                if (i >= message.length) clearInterval(typingTimer.current!);
            }, typingSpeed);
        } else {
            setBubbleText("");
        }
        return () => {
            if (typingTimer.current) clearInterval(typingTimer.current);
        };
    }, [isHovered, message, typingSpeed]);

    return (
        <>
            {/* Speech bubble */}
            <div
                className={`fixed ${bubbleBottomOffset} ${bubbleRightOffset} z-10 pointer-events-none select-none transition-all duration-150 ${
                    isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"
                }`}
            >
                <div className="relative rotate-[-1.5deg]">
                    <svg width="242" height="72" viewBox="0 0 242 72" fill="none" xmlns="http://www.w3.org/2000/svg">
                        {/* Bubble + tail as one filled shape */}
                        <path
                            d="M14 4 C14 4 80 0 140 1 C180 1 228 2 229 14 C230 26 229 42 228 52 C227 61 220 65 206 66 C175 67 80 67 36 66 C18 65 10 59 10 50 C9 38 10 20 11 12 C12 7 13 4 14 4 Z M185 66 C188 69 196 74 192 76 C184 72 172 68 168 67 Z"
                            fill="white"
                            stroke="#1c1c1c"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                        {/* Hard offset shadow */}
                        <path
                            d="M14 4 C14 4 80 0 140 1 C180 1 228 2 229 14 C230 26 229 42 228 52 C227 61 220 65 206 66 C175 67 80 67 36 66 C18 65 10 59 10 50 C9 38 10 20 11 12 C12 7 13 4 14 4 Z M185 66 C188 69 196 74 192 76 C184 72 172 68 168 67 Z"
                            fill="none"
                            stroke="#1c1c1c"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            transform="translate(3,3)"
                            opacity="0.15"
                        />
                    </svg>
                    <p
                        className="absolute top-0 left-0 right-0 bottom-[12px] flex items-center justify-center text-sm font-bold text-zinc-900 whitespace-nowrap px-5"
                        style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Comic Neue', cursive" }}
                    >
                        {bubbleText}
                        {bubbleText.length < message.length && (
                            <span className="animate-pulse ml-px">|</span>
                        )}
                    </p>
                </div>
            </div>

            {/* Button */}
            <button
                type="button"
                aria-label={ariaLabel}
                className={`fixed ${bottomOffset} ${rightOffset} z-0 cursor-pointer pointer-events-auto transition-transform duration-200 hover:scale-110 active:scale-95`}
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Image
                    src={isHovered ? hoverImage : defaultImage}
                    alt={ariaLabel}
                    width={imageSize}
                    height={imageSize}
                    sizes={`${imageSize}px`}
                    priority
                    className="h-auto w-56"
                />
            </button>
        </>
    );
}
