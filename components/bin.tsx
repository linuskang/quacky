"use client";

import { useState } from "react";
import Image from "next/image";
import { Patrick_Hand } from "next/font/google";
import { CurvedLine } from "./curved_parabola";

const patrickHand = Patrick_Hand({
    subsets: ["latin"],
    weight: "400",
});

interface InteractiveButtonProps {
    onClick?: () => void;
    hoverImage: string;
    defaultImage: string;
}

export function Feedback(
    {
        onClick,
        hoverImage,
        defaultImage,
    }: InteractiveButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            <div className="fixed bottom-44 right-24 z-10 pointer-events-none">
                <div className="relative w-64 h-32">
                    <span
                        className={`${patrickHand.className} absolute left-0 top-0 text-2xl font-bold`}
                    >
                        have any feedback
                        for me?
                    </span>

                    <CurvedLine
                        from={{ x: 100, y: 50 }}
                        to={{ x: 220, y: 160 }}
                        strokeWidth={4}
                        wobble={-50}
                    />
                </div>
            </div>

            <button
                type="button"
                aria-label="Interactive Button"
                className="fixed -bottom-10 -right-15 z-0 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                onClick={onClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <Image
                    src={isHovered ? hoverImage : defaultImage}
                    alt="Interactive Button"
                    width={220}
                    height={220}
                    className="h-auto w-56"
                    priority
                />
            </button>
        </>
    );
}
