import { getSession } from "@/server/auth"
import { NextResponse, NextRequest } from "next/server"
import { auth } from "@/server/auth"
import { Email } from "@/server/helpers"
import { Up } from "@/server/upstream"
import { env } from "@/env"
import { v4 as uuidv4 } from "uuid"

type Invite = {
    email: string
    role: "admin" | "user"
    displayName: string
    username: string
}

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session || session.user.role !== "admin") {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    const { email, role, displayName, username } = await req.json() as Invite

    if (!email || !role || !displayName || !username) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        )
    }

    // random password. user needs to change in profile settings.
    const newPassword = uuidv4()


    const res = await auth.api.createUser({
        body: {
            email: email,
            role: role,
            name: displayName,
            password: newPassword,
            data: {
                username: username,
                emailVerified: true,
            }
        }
    })

    const { error: emailError } = await Email.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: "You've been invited to join Quacky!",
        html: `
            <p>Hello ${displayName},</p>
            <p>You have been invited to join Quacky by your organisation (${env.ORG_NAME}).</p>
            <div style="border: 1px solid #d1d5db; border-radius: 4px; padding: 10px 12px;">
                <p style="margin: 0 0 8px;"><strong>Email:</strong> ${email}</p>
                <p style="margin: 0;"><strong>Password:</strong> ${newPassword}</p>
            </div>
            <p>Click the link below to get started:</p>
            <a href="${env.BETTER_AUTH_URL}/auth/login">Join Quacky</a>
        `
    })

    if (emailError) {
        throw new Error(`Failed to send invitation email: ${emailError.message}`)
    }

    await Up.ingest({
        title: `${email} has been invited to join Quacky`,
        icon: "🆕",
        content: `An invitation has been sent to ${email} with the role of ${role}.`,
        fields: [
            {
                name: "Email",
                value: email,
            },
            {
                name: "Role",
                value: role,
            },
            {
                name: "Display Name",
                value: displayName,
            },
            {
                name: "Username",
                value: username,
            },
            {
                name: "Invited by",
                value: session.user.email,
            }
        ],
        actions: [
            {
                type: "default",
                title: "View User",
                url: `${env.BETTER_AUTH_URL}/@${username}`,
            }
        ],
        data: {
            res,
            session,
        }
    })

    return NextResponse.json(
        { success: true, tempPassword: newPassword },
        { status: 200 }
    )
}
