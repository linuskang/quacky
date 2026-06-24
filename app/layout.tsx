import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner";
import { Lexend } from "next/font/google";
const lexend = Lexend({ subsets: ["latin"] });


export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
        >
            <body
                className={`${lexend.className} antialiased`}
            >
                <TooltipProvider>
                    <ThemeProvider>
                        <Toaster
                            position="top-center"
                        />
                        {children}
                    </ThemeProvider>
                </TooltipProvider>
            </body>
        </html>
    )
}
