//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { playfairDisplay } from "@/app/layout";

type Props = {
    children: ReactNode;
    className?: string;
};

export function Title({ children, className }: Props) {
    return (
        <h1
            className={cn(
                "text-2xl font-semibold text-primary",
                className
            )}
        >
            {children}
        </h1>
    );
}

export function Description({ children, className }: Props) {
    return (
        <p
            className={cn(
                "text-sm text-muted-foreground",
                className
            )}
        >
            {children}
        </p>
    );
}

export function PrimaryTitle({ children, className }: Props) {
    return (
        <h1
            className={cn(
                "text-4xl font-semibold text-primary italic",
                playfairDisplay.className,
                className
            )}
        >
            {children}
        </h1>
    );
}
