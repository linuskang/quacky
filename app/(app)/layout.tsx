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
            <PageLeft>
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

            <PageCenter>{children}</PageCenter>

            <Feedback />
        </PageLayout>
    )
}
