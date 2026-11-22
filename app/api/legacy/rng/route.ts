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
function isPrismaUniqueError(error: unknown): error is { code: string } {
    return (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        (error as { code: string }).code === "P2002"
    )
}

function todayDate() {
    const now = new Date()
    return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )
}

async function getRank(number: number, date: Date) {
    const higher = await prisma.rngEntry.count({
        where: {
            date,
            number: {
                gt: number,
            },
        },
    })
    return higher + 1
}

export async function POST() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const date = todayDate()

    const currentEntry = await prisma.rngEntry.findUnique({
        where: {
            userId_date: {
                userId: session.user.id,
                date,
            },
        },
    })

    if (currentEntry) {
        return NextResponse.json(
            { error: "You have already submitted a request for today." },
            { status: 400 }
        )
    }

    const randomNumber = Math.floor(Math.random() * 1000000) + 1

    try {
        const newEntry = await prisma.rngEntry.create({
            data: {
                userId: session.user.id,
                number: randomNumber,
                date,
            },
        })

        const rank = await getRank(newEntry.number, date)

        return NextResponse.json(
            { success: true, number: newEntry.number, rank },
            { status: 201 }
        )
    } catch (error) {
        if (isPrismaUniqueError(error)) {
            return NextResponse.json(
                { error: "You have already submitted a request for today." },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: "Something went wrong." },
            { status: 500 }
        )
    }
}

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const date = todayDate()

    const todayEntry = await prisma.rngEntry.findUnique({
        where: {
            userId_date: {
                userId: session.user.id,
                date,
            },
        },
    })

    if (!todayEntry) {
        return NextResponse.json(
            { error: "No entry found for today." },
            { status: 404 }
        )
    }

    const rank = await getRank(todayEntry.number, date)

    return NextResponse.json(
        { success: true, number: todayEntry.number, rank },
        { status: 200 }
    )
}
