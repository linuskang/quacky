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

import { getSession } from "@/server/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/server/prisma"

const metrics = ["wellbeing", "happiness", "stress", "sleep", "energy"] as const

type Metric = (typeof metrics)[number]

function round(value: number) {
    return Math.round(value * 100) / 100
}

export async function GET() {
    const session = await getSession()

    if (!session) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "admin") {
        return new NextResponse("403 Forbidden", { status: 403 })
    }

    const checkIns = await prisma.checkIn.findMany({
        select: {
            userId: true,
            date: true,
            wellbeing: true,
            happiness: true,
            stress: true,
            sleep: true,
            energy: true,
            assistance: true,
        },
        orderBy: { date: "asc" },
    })

    const totals = Object.fromEntries(
        metrics.map((metric) => [metric, 0])
    ) as Record<Metric, number>
    const distributions = Object.fromEntries(
        metrics.map((metric) => [
            metric,
            Array.from({ length: 5 }, (_, index) => ({
                score: index + 1,
                count: 0,
            })),
        ])
    ) as Record<Metric, { score: number; count: number }[]>
    const daily = new Map<
        string,
        Record<Metric, number> & { checkIns: number }
    >()

    let assistanceRequests = 0

    for (const checkIn of checkIns) {
        const date = checkIn.date.toISOString().slice(0, 10)
        const day = daily.get(date) ?? {
            checkIns: 0,
            wellbeing: 0,
            happiness: 0,
            stress: 0,
            sleep: 0,
            energy: 0,
        }

        day.checkIns++
        assistanceRequests += Number(checkIn.assistance)

        for (const metric of metrics) {
            const score = checkIn[metric]
            totals[metric] += score
            day[metric] += score

            if (score >= 1 && score <= 5) {
                distributions[metric][score - 1].count++
            }
        }

        daily.set(date, day)
    }

    const totalCheckIns = checkIns.length
    const averages = Object.fromEntries(
        metrics.map((metric) => [
            metric,
            totalCheckIns ? round(totals[metric] / totalCheckIns) : 0,
        ])
    ) as Record<Metric, number>
    const dailyAverages = Array.from(daily, ([date, values]) => ({
        date,
        checkIns: values.checkIns,
        ...Object.fromEntries(
            metrics.map((metric) => [
                metric,
                round(values[metric] / values.checkIns),
            ])
        ),
    }))

    return NextResponse.json({
        summary: {
            totalCheckIns,
            participatingStudents: new Set(
                checkIns.map((checkIn) => checkIn.userId)
            ).size,
            assistanceRequests,
            assistanceRate: totalCheckIns
                ? round((assistanceRequests / totalCheckIns) * 100)
                : 0,
            averages,
        },
        daily: dailyAverages,
        distributions,
    })
}
