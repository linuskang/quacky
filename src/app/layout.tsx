//    ____                   _          
//   / __ \                 | |         
//  | |  | |_   _  __ _  ___| | ___   _ 
//  | |  | | | | |/ _` |/ __| |/ / | | |
//  | |__| | |_| | (_| | (__|   <| |_| |
//   \___\_\\__,_|\__,_|\___|_|\_\\__, |
//                                 __/ |
//                                |___/ 

// Libraries
import type { Metadata } from "next";
import Script from "next/script";

// Styling
import "./globals.css"

// Components
import { TooltipProvider } from "@/components/ui/tooltip"
import ThemeProvider from "@/components/ui/theme-provider"
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ["latin"] });

// Meta
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

                {/* shhhhhh, its my analytics! using umami. */}    
                <Script
                    src="https://analytics.lkang.au/script.js"
                    data-website-id="93d61a24-4b64-4c06-afab-8178505d2612"
                    strategy="afterInteractive"
                />

            </body>
        </html>
    );
}
