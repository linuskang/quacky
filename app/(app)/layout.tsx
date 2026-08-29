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

// Libraries
import { requireSession } from "@/server/auth"

// Components
import { Sidebar } from "@/components/sidebar"
import { Profile } from "@/components/profile"
import { PageLayout, PageLeft, PageCenter } from "@/components/page-layout"
import { Feedback } from "@/components/feedback"
import { BottomBar } from "@/components/bottom-bar"
import { MobileNav } from "@/components/mobile-nav"
import { Debug } from "@/components/debug"
import { VerificationBanner } from "@/components/verification-email-banner"

export const metadata = {
    title: "Quacky",
    description: "A social media platform by linus.",
}

export default async function QuackyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await requireSession()
    return (
        <div className="flex min-h-dvh flex-col">
            <div>
                <VerificationBanner />
                <PageLayout className="flex-1 goose-wallpaper">
                    <PageLeft className="z-20">
                        <Sidebar
                            session={{
                                user: {
                                    handle: session.user.username,
                                    image: session.user.image!,
                                    role: session.user.role!,
                                },
                            }}
                        />

                        <div className="mt-auto">
                            <Profile />
                        </div>
                    </PageLeft>

                    <PageCenter className="relative z-20 pb-24 lg:pb-16">{children}</PageCenter>

                    <Feedback />
                    <BottomBar />
                    {session.user.statsForNerds && (
                        <div className="bottom-20 mb-15 flex items-center justify-center lg:bottom-3">
                            <Debug />
                        </div>
                    )}
                </PageLayout>

                <MobileNav handle={session.user.username} />
            </div>
        </div>
    )
}
