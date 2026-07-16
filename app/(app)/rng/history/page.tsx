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

import { redirect } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Title, Description } from "@/components/text"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface RankedEntry {
    id: string
    date: Date
    number: number
    rank: number
}

function rankEmoji(rank: number) {
    if (rank === 1) return "🥇"
    if (rank === 2) return "🥈"
    if (rank === 3) return "🥉"
    return `#${rank}`
}

export default async function Page() {
    const session = await getSession()

    if (!session) {
        redirect("/auth/login")
    }

    const entries = await prisma.rngEntry.findMany({
        where: {
            userId: session.user.id,
        },
        orderBy: {
            date: "desc",
        },
        take: 31,
    })

    const ranked: RankedEntry[] = await Promise.all(
        entries.map(async (entry) => {
            const higher = await prisma.rngEntry.count({
                where: {
                    date: entry.date,
                    number: {
                        gt: entry.number,
                    },
                },
            })
            return {
                id: entry.id,
                date: entry.date,
                number: entry.number,
                rank: higher + 1,
            }
        })
    )

    return (
        <PageLayout>
            <PageCenter>
                <Title>roll history</Title>
                <Description>
                    look back at your biggest (and smallest) moments
                </Description>

                {ranked.length === 0 ? (
                    <Card className="bg-card-primary p-4 text-center">
                        <p className="text-sm font-semibold text-muted-foreground">
                            You haven&apos;t rolled yet. Go back and spin!
                        </p>
                    </Card>
                ) : (
                    <div className="flex flex-col gap-2">
                        {ranked.map((entry) => (
                            <Card
                                key={entry.id}
                                className="bg-card-primary p-3"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <p className="text-sm font-bold text-muted-foreground">
                                            {format(entry.date, "MMM d, yyyy")}
                                        </p>
                                        <p className="text-xs font-semibold text-primary-2">
                                            {rankEmoji(entry.rank)} that day
                                        </p>
                                    </div>
                                    <p className="text-2xl font-bold text-primary tabular-nums">
                                        {entry.number.toLocaleString()}
                                    </p>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                <Button
                    variant="secondary"
                    className="mt-2 h-10 rounded-full px-4 text-lg font-semibold"
                    asChild
                >
                    <Link href="/rng">back to rng</Link>
                </Button>
            </PageCenter>
        </PageLayout>
    )
}
