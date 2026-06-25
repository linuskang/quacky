"use client";

import { useState } from "react";
import Image from "next/image";

interface InteractiveButtonProps {
    onClick?: () => void;
    hoverImage: string;
    defaultImage: string;
}

export function InteractiveButton(
    {
        onClick,
        hoverImage,
        defaultImage,
    }: InteractiveButtonProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <button
            type="button"
            aria-label="Interactive Button"
            className={`fixed -bottom-10 -right-15 z-0 cursor-pointer pointer-events-auto transition-transform duration-200 hover:scale-110 active:scale-95`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Image
                src={isHovered ? hoverImage : defaultImage}
                alt="Interactive Button"
                width={220}
                height={220}
                sizes="220px"
                priority
                className="h-auto w-56"
            />
        </button>
    );
}
