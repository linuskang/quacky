// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Social Media Academy · Quacky',
    description: 'Learn to navigate social media safely — one level at a time.',
};

export default function GameLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
