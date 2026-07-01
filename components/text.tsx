import { ReactNode } from "react";
import { cn } from "@/lib/utils";

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