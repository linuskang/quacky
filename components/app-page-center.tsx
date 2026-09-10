"use client"

import { usePathname } from "next/navigation"

import { PageCenter } from "@/components/page-layout"
import { cn } from "@/lib/utils"

export function AppPageCenter({
    children,
    className,
}: {
    children: React.ReactNode
    className?: string
}) {
    const pathname = usePathname()
    const isQuiz = pathname.startsWith("/quiz/")

    return (
        <PageCenter
            className={cn(isQuiz && "max-w-7xl", className)}
        >
            {children}
        </PageCenter>
    )
}
