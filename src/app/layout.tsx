// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css"

import { TooltipProvider } from "@/components/ui/tooltip"
import ThemeProvider from "@/components/ui/theme-provider"
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: 'Quacky',
    description: 'Simple and open social media, for teens.',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body
                className={`${lexend.className} antialiased`}
            >
                <ThemeProvider>
                    <TooltipProvider>
                        {children}
                    </TooltipProvider>
                </ThemeProvider>
                <Script
                    src="https://analytics.lkang.au/script.js"
                    data-website-id="93d61a24-4b64-4c06-afab-8178505d2612"
                    strategy="afterInteractive"
                />
            </body>
        </html>
    );
}
