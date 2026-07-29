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
import { NextResponse, NextRequest } from "next/server"
import { v4 as uuidv4 } from "uuid"

// Utilities
import { getSession } from "@/server/auth"
import { auth } from "@/server/auth"

import { Email } from "@/server/helpers"
import { Up } from "@/server/upstream"

import { Response } from "@/lib/responses"

import { env } from "@/env"

// Types
type Invite = {
    email: string
    role: "admin" | "user"
    displayName: string
    username: string
}

export async function POST(req: NextRequest) {
    const session = await getSession()

    if (!session || session.user.role !== "admin") {
        return Response.Unauthorized()
    }

    const { email, role, displayName, username } = await req.json() as Invite

    if (!email || !role || !displayName || !username) {
        return Response.BadRequest()
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

    const { error } = await Email.emails.send({
        from: env.EMAIL_FROM,
        to: email,
        subject: "You've been invited to join Quacky!",

        // https://html.onlineviewer.net/
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

    if (error) {
        throw new Error(error.message)
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

    return Response.Success({
        message: "User invited",
        tempPassword: newPassword
    })
}
