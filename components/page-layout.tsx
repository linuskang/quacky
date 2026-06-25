"use client";

export function PageLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="relative min-h-screen w-full bg-background">
            {children}
        </main>
    )
}

export function PageCenter({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-3 mx-auto w-full max-w-xl px-4 py-4">
            {children}
        </div>
    )
}

export function PageLeft({ children }: { children: React.ReactNode }) {
    return (
        <aside className="fixed left-0 top-0 h-screen w-64 hidden lg:flex flex-col py-4 px-4">
            {children}
        </aside>
    )
}

export function PageRight({ children }: { children: React.ReactNode }) {
    return (
        <aside className="fixed right-0 top-0 h-screen w-80 hidden xl:flex flex-col py-8 gap-4 px-4 overflow-y-auto">
            {children}
        </aside>
    )
}