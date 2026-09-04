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
import { NextRequest } from "next/server"

// Utilities
import { getSession } from "@/server/auth"

import { NotificationService } from "@/server/helpers"
import { getCommentById } from "@/server/comment"
import { Admin } from "@/server/administration"
import { addXP } from "@/server/users"
import { askAi } from "@/server/helpers"
import { send } from "@/server/notification"

import { Up } from "@/server/upstream"

import { env } from "@/env"
import { xp } from "@/lib/var"

import { Response } from "@/lib/responses"

export async function POST(
    req: NextRequest,
    {
        params,
    }: {
        params: Promise<{ id: string }>
    }
) {
    const session = await getSession()

    if (!session) {
        return Response.Unauthorized()
    }

    const { id } = await params
    const comment = await getCommentById(id)

    if (!comment) {
        return Response.NotFound("Comment not found")
    }

    const body = (await req.json()) as {
        reason: string
    }

    if (!body.reason) {
        return Response.BadRequest("reason is required")
    }

    // uses ai harness in @/server/helpers
    const aiResponse = await askAi(
        `
        You are a content moderation system for Quacky.

        Determine whether a user's comment violates Quacky's rules.

        A comment is inappropriate if it contains or promotes:
        - hate speech
        - threats or encouragement of violence
        - harassment or targeted bullying
        - explicit sexual content
        - spam, scams, or impersonation
        - encouragement of self-harm
        - private personal information (doxxing)
        - usernames or profile text designed primarily to abuse or evade moderation

        The report reason is only additional context. Do NOT assume the report is truthful.
        However, with your own judgement, if the user's comment is inappropriate, return true even if the report reason is not entirely accurate.

        With your AI report reason, please be mindful that you do not include the offensive content in your response.
        Instead, provide a short consise summary of what rule was broken, and a brief explanation without giving anything inappropriate on what was flagged.

        Return ONLY valid JSON.

        {
        "is_inappropriate": boolean,
        "reason": string
        }

        If the comment is acceptable, return:

        {
        "is_inappropriate": false,
        "reason": ""
        }
    `,
        `
        Comment: ${comment.content}
        User: ${comment.author.username}

        Reporter's reason:
        ${body.reason}
    `
    )

    const determinedResult = JSON.parse(aiResponse)

    // flag
    if (determinedResult.is_inappropriate) {
        await Admin.flagComment(comment.id)
        await send(
            comment.authorId,
            "quacky",
            `Hello, ${comment.author.name}. \n\nYour [content](${env.BETTER_AUTH_URL}/content/${comment.postId}), created on **${new Date().toLocaleDateString("en-AU", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}** has been unlisted: **${determinedResult.reason}**\n\nThis incident has been flagged pending further review from an administrator.\n\nPlease ensure you are familiar with our [Community Guidelines](https://quacky.space/terms) to avoid further incidents.\n\nIf you believe this is a mistake, talk to a school admin.`
        )
    }

    // report abuse rewards
    await addXP(session.user.username, xp.report)

    await send(
        session.user.id,
        "quacky",
        `Hello, ${session.user.name}. \n\nThank you for reporting abuse content you thought was inappropriate by **${comment.author.username}**.\n\nYour report has been submitted and will be reviewed by an administrator shortly.\n\nYou have earned **${xp.report} XP** for your contribution to keeping the community safe.\n\n Thankyou!`
    )

    // log for admins.
    await Up.ingest({
        title: "New comment Report - " + comment.id,
        icon: "🚩",
        description: `A new report has been submitted for comment ${comment.id}. Reason: ${body.reason}`,
        fields: [
            {
                title: "Author Username",
                value: comment.author.username,
            },
            {
                title: "Author ID",
                value: comment.authorId,
            },
            {
                title: "Auto Flagged?",
                value: determinedResult.is_inappropriate ? "Yes" : "No",
            },
            {
                title: "AI Reason",
                value: determinedResult.reason,
            },
        ],
        data: {
            offender: comment,
            reportReason: body.reason,
            ai: {
                isInappropriate: determinedResult.is_inappropriate,
                reason: determinedResult.reason,
            },
        },
        actions: [
            {
                title: "View Comment",
                variant: "primary",
                url: `https://quacky.space/comment/${comment.id}`,
            },
        ],
    })

    return Response.Success("Report submitted, thanks!")
}
