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

import { prisma } from "./prisma"

const DAY_MS = 24 * 60 * 60 * 1000

function calendarDate(date = new Date()) {
    return new Date(
        Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    )
}

function dateKey(date: Date) {
    const day = calendarDate(date)

    return [
        day.getUTCFullYear(),
        (day.getUTCMonth() + 1).toString().padStart(2, "0"),
        day.getUTCDate().toString().padStart(2, "0"),
    ].join("-")
}

function addDays(date: Date, days: number) {
    const next = new Date(date)
    next.setUTCDate(next.getUTCDate() + days)
    return next
}

interface CheckInProps {
    userId: string
    date: Date
    wellbeing: number
    happiness: number
    stress: number
    sleep: number
    energy: number
    assistance: boolean
}

export async function checkIn({
    userId,
    date,
    wellbeing,
    happiness,
    stress,
    sleep,
    energy,
    assistance,
}: CheckInProps) {
    const checkIn = await prisma.checkIn.create({
        data: {
            userId,
            date: calendarDate(date),
            wellbeing,
            happiness,
            stress,
            sleep,
            energy,
            assistance,
        },
    })

    return checkIn
}

export async function hasCheckedIn(userId: string) {
    const today = calendarDate()
    const tomorrow = addDays(today, 1)

    const checkIn = await prisma.checkIn.findFirst({
        where: {
            userId,
            OR: [
                {
                    date: today,
                },
                {
                    createdAt: {
                        gte: today,
                        lt: tomorrow,
                    },
                },
            ],
        },
    })

    return Boolean(checkIn)
}

export async function getCheckInSummary(userId: string) {
    const today = calendarDate()
    const monday = new Date(today)
    const day = today.getUTCDay()
    monday.setUTCDate(today.getUTCDate() - (day === 0 ? 6 : day - 1))

    const earliest = new Date(today.getTime() - 365 * DAY_MS)

    const checkIns = await prisma.checkIn.findMany({
        where: {
            userId,
            date: {
                gte: earliest,
            },
        },
        select: {
            date: true,
            createdAt: true,
        },
    })

    const checkedDates = new Set(
        checkIns.map((checkIn) => dateKey(checkIn.date))
    )

    let currentStreak = 0
    const cursor = checkedDates.has(dateKey(today))
        ? new Date(today)
        : addDays(today, -1)

    while (checkedDates.has(dateKey(cursor))) {
        currentStreak++
        cursor.setUTCDate(cursor.getUTCDate() - 1)
    }

    const weekDates = Array.from({ length: 7 }, (_, index) => {
        const date = addDays(monday, index)
        return checkedDates.has(dateKey(date))
    })

    return {
        current: currentStreak,
        week: {
            mon: weekDates[0],
            tue: weekDates[1],
            wed: weekDates[2],
            thu: weekDates[3],
            fri: weekDates[4],
            sat: weekDates[5],
            sun: weekDates[6],
        },
    }
}
