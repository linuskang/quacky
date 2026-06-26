import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner";
import { Exo_2, Lexend, Patrick_Hand, Playfair_Display } from "next/font/google";

const lexend = Lexend({ subsets: ["latin"] });
export const patrickHand = Patrick_Hand({ weight: "400", subsets: ["latin"] });
export const playfairDisplay = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    style: ["normal", "italic"],
    weight: ["400", "700"],
});

export const exo2 = Exo_2({
    subsets: ["latin"],
    variable: "--font-exo",
});

export const timesNewRoman = {
    className: "font-[family-name:'Times_New_Roman',Times,serif]",
} as const;

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
