import { NextResponse } from "next/server"
import { z } from "zod"

import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { Email } from "@/server/helpers"
import { env } from "@/env"

const parentEmailSchema = z.object({
    parentEmail: z.email(),
})

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;")
}

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { parentEmail: true },
    })

    return NextResponse.json({ parentEmail: user?.parentEmail ?? null })
}

export async function POST(request: Request) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parsed = parentEmailSchema.safeParse(await request.json())

    if (!parsed.success) {
        return NextResponse.json(
            { error: "Please enter a valid parent email address." },
            { status: 400 }
        )
    }

    const parentEmail = parsed.data.parentEmail.trim().toLowerCase()
    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { parentEmail },
        select: { name: true, username: true },
    })

    const studentName = escapeHtml(user.name)
    const username = escapeHtml(user.username)
    const { error } = await Email.emails.send({
        from: env.EMAIL_FROM,
        to: parentEmail,
        subject: `${user.name} selected you as their parent on Quacky`,
        html: `
            <p>Hello,</p>
            <p>${studentName} (@${username}) selected you as their parent on Quacky.</p>
            <p>You will receive a weekly digest with an overview of what they have been doing on the platform.</p>
            <p>If you believe this was sent in error, please contact the Quacky administrators.</p>
        `,
    })

    if (error) {
        return NextResponse.json(
            { error: "The parent email was saved, but the notification could not be sent." },
            { status: 502 }
        )
    }

    return NextResponse.json({ parentEmail })
}
