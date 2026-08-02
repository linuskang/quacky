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

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { Metadata } from "next"
import Script from "next/script"
import { lexend, exo2, playfairDisplay } from "@/lib/fonts"

export const metadata: Metadata = {
    title: "Quacky",
    description: "Simple and open social media, for the classroom.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Quacky"
    }
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0a0a0a",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={`${playfairDisplay.variable} ${exo2.variable}`}
        >
            <body className={`${lexend.className} bg-background antialiased`}>
                <Script
                    id="beforeinstallprompt"
                    strategy="beforeInteractive"
                    dangerouslySetInnerHTML={{
                        __html: `
                            window.addEventListener('beforeinstallprompt', (e) => {
                                e.preventDefault();
                                window.deferredInstallPrompt = e;
                            });
                        `,
                    }}
                />
                <TooltipProvider>
                    <ThemeProvider>
                        <Toaster position="top-center" />
                        {children}
                    </ThemeProvider>
                </TooltipProvider>
            </body>
        </html>
    )
}
