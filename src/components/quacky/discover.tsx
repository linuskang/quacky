"use client";

// UI Components
import { TrendingUp, Flame } from "lucide-react";
import { Button } from "@/components/ui/button";

// Types
interface Props {
    session: {
        user: {
            name: string;
            handle: string;
            image?: string | null;
        }
    }
}

export default function Discover({ session }: Props) {

    if (!session) {
        return (
            <aside className="sticky top-0 w-80 shrink-0 hidden lg:flex flex-col gap-4 pt-8 lg:h-screen overflow-y-auto pb-8">
                <div className="rounded-xl bg-[var(--lynt)] border border-border p-4">
                    <h2 className="text-xl font-bold text-primary mb-2 flex items-center gap-2">
                        Welcome to Quacky
                    </h2>
                    <div className="flex flex-col mb-4">
                        Connect with friends, follow your favourite creators, and discover what's happening in the world.
                    </div>

                    <Button
                        onClick={() => (window.location.href = '/login')}
                        className="w-full h-11 cursor-pointer flex items-center justify-center"
                    >
                        Sign in
                    </Button>
                </div>
            </aside>
        )
    }

    return (
        <aside className="sticky top-0 w-80 shrink-0 hidden lg:flex flex-col gap-4 pt-8 lg:h-screen overflow-y-auto pb-8">
            <div className="rounded-xl bg-[var(--lynt)] border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <TrendingUp size={24} strokeWidth={3} />
                    Latest News
                </h2>
                <div className="flex flex-col gap-3">
                    <p>Temporarily disabled</p>
                </div>
            </div>

            <div className="rounded-xl bg-[var(--lynt)] border border-border p-4">
                <h2 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                    <Flame size={24} strokeWidth={3} fill="currentColor" />
                    What's Happening
                </h2>
                <div className="flex flex-col gap-3">
                    <p>Temporarily disabled</p>
                </div>
            </div>
        </aside>
    );
}
