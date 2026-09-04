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
import { PageLayout, PageLeft, PageCenter, PageRight } from "@/components/page-layout"
import { Feedback } from "@/components/feedback"
import { BottomBar } from "@/components/bottom-bar"
import { MobileNav } from "@/components/mobile-nav"
import { Debug } from "@/components/debug"
import { VerificationBanner } from "@/components/verification-email-banner"
import { isDowntime, getDowntimeDay } from "@/server/downtime"
import { Eye } from "lucide-react"
import { Card } from "@/components/ui/card"
import Image from "next/image"
import { downtime } from "@/lib/var"

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
    if (isDowntime() && session.user.role !== "admin") {
        return (
            <div className="flex min-h-dvh flex-col">
                <div>
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
                        <PageCenter>
                            <div className="flex min-h-dvh items-center justify-center">
                                <Card className="bg-card-primary p-8 text-center !border-none !rounded-none">
                                    <div>
                                        <Image
                                            src="/logo.png"
                                            alt="Downtime enforced"
                                            width={200}
                                            height={200}
                                            className="mx-auto mb-4"
                                        />
                                        <h1 className="text-2xl font-bold text-primary">
                                            Time for bed!
                                        </h1>
                                        <p className="text-sm text-primary-2">
                                            Come back later at{" "}
                                            <span className="font-semibold text-primary">
                                                {downtime.schedule[getDowntimeDay()].end}
                                            </span>{" "}
                                            to continue using Quacky.
                                        </p>
                                    </div>
                                </Card>
                            </div>
                        </PageCenter>
                        <PageRight>
                            <Feedback />
                        </PageRight>
                    </PageLayout>

                </div>
            </div>
        )
    }
    return (
        <div className="flex min-h-dvh flex-col">
            <div>
                <VerificationBanner />
                {isDowntime() && session.user.role === "admin" && (
                    <div className="fixed left-0 right-0 z-40 flex w-full items-center justify-center gap-2 bg-primary-2 text-center text-sm dark:text-black text-white">
                        <Eye className="size-4 shrink-0" />
                        <span>Downtime is currently enforced. Only admins can access the site.</span>
                    </div>
                )}
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
