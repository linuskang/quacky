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
        <PageLayout>
            <div className="fixed top-0 right-0 left-0 z-10 h-6 bg-primary-2">
                <p className="text-xs text-center leading-6 text-primary-foreground">
                    Quacky is in v0.2 beta. Thanks for trying my app out {":>"}
                </p>
            </div>

            <PageLeft className="z-20 pt-10">
                <Sidebar
                    session={{
                        user: {
                            handle: session.user.username,
                            image: session.user.image,
                        },
                    }}
                />

                <div className="mt-auto">
                    <Profile />
                </div>
            </PageLeft>

            <PageCenter className="relative z-20 pt-10 pb-16">{children}</PageCenter>

            <Feedback />
            <BottomBar />
        </PageLayout>
    )
}
