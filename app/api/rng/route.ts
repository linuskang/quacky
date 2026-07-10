import { getSession } from "@/server/auth"
import { NextResponse } from "next/server"
import { prisma } from "@/server/prisma"

function todayDate() {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
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
        return NextResponse.json({ error: "You have already submitted a request for today." }, { status: 400 })
    }

    const randomNumber = Math.floor(Math.random() * 1000000) + 1 // lol

    const newEntry = await prisma.rngEntry.create({
        data: {
            userId: session.user.id,
            number: randomNumber,
            date,
        },
    })

    return NextResponse.json({ success: true, number: newEntry.number }, { status: 201 })
}

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const todayEntry = await prisma.rngEntry.findUnique({
        where: {
            userId_date: {
                userId: session.user.id,
                date: todayDate(),
            }
        }
    })

    if (!todayEntry) {
        return NextResponse.json({ error: "No entry found for today." }, { status: 404 })
    }

    return NextResponse.json({ success: true, number: todayEntry.number }, { status: 200 })
}
