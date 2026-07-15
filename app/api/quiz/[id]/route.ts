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

import { quizes } from "@/lib/var"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import {
    unlockPosting,
    unlockCommenting,
    unlockDms,
    unlockProfiles,
    unlockFuzzies,
} from "@/server/users"
import { Up } from "@/server/upstream"
import { addXP } from "@/server/users"
import { NotificationService, chat } from "@/server/helpers"
import { env } from "@/env"

// Types
type Option = {
    id: string
    text: string
    correct?: boolean
}

type Question =
    | {
        id: number
        question: string
        type: "multiple-choice"
        options: Option[]
    }
    | {
        id: number
        question: string
        type: "text"
        answer: string
        options?: Option[]
    }

type Quiz = {
    id: string
    name: string
    description: string
    to: string
    time: string
    xp: number
    questions: Question[]
}

// simple function for the ai grading of text based answers.
async function evalResponse(
    question: string,
    rubric: string,
    submitted: string
): Promise<
    {
        correct: boolean;
        feedback: string
    }
> {
    if (!submitted) {
        return {
            correct: false,
            feedback: "No answer submitted.",
        }
    }

    const response = await chat([
        {
            role: "system",
            content:
                `
                You are grading a quiz answer.
                Respond with only a JSON object with two fields: 'correct' (boolean) and 'feedback' (string).

                The feedback should be 1-2 sentences explaining why the answer is correct or how it could be improved.
                Please remember when writing this feedback, you are directly explaining to the user, and how they can improve their answer.
                Do not give them extremely obvious hints which they can easily identify from the rubric, instead, guide the user towards the correct answer by explaining what they did wrong, and how they can improve their answer.

                Additionally, your feedback should be guiding questions, not direct answers in your feedback that explain how to pass the rubric

                Do not add any other text outside the JSON.
                `,
        },
        {
            role: "user",
            content:
                `
                The question is: ${question}
                Mark the submitted answer against this rubric: ${rubric}

                The user submitted: ${submitted}
                `,
        },
    ])

    const parsed = JSON.parse(response) as {
        correct: boolean
        feedback: string
    }

    return {
        correct: parsed.correct,
        feedback: parsed.feedback,
    }
}

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()
    const { id } = await params

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }

    // find array by id
    const quiz = quizes.find(
        (q) => q.id === id
    ) as Quiz

    if (!quiz) {
        return new NextResponse("Quiz not found", {
            status: 404,
        })
    }

    return NextResponse.json({
        questions: quiz.questions.map((question, index) => {
            const base = {
                no: index + 1, // from 0,1,2,3,etc
                question: question.question,
                type: question.type,
            }

            if (question.type === "text") {
                return base
            }

            return {
                ...base,
                options: question.options.map((option) => (
                    {
                        id: option.id,
                        text: option.text,
                    }
                )),
            }
        }),
        meta: {
            name: quiz.name,
            description: quiz.description,
        },
    })
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await getSession()
    const { id } = await params

    if (!session) {
        return new NextResponse("Unauthorized", {
            status: 401,
        })
    }


    // same as above
    const quiz = quizes.find(
        (q) => q.id === id
    ) as Quiz

    if (!quiz) {
        return new NextResponse("Quiz not found", {
            status: 404,
        })
    }

    const answers = await req.json()

    // array with just numbers.
    // e.g. [1,2,3] are incorrect
    const wrong: number[] = []
    // string array w/ feedback for each text q
    const feedback: Record<number, string> = {}

    // for every question, check if answer is correct
    for (let i = 0; i < quiz.questions.length; i++) {
        // array index number
        const question = quiz.questions[i]
        // plus 1 because our questions start at 1, and go up using
        // 1,2,3,4,5
        const questionNo = i + 1
        // check the answer submitted by question
        const submitted = answers[questionNo]

        if (question.type === "text") {
            // text questions are evaluated by AI against the provided answer rubric
            const result = await evalResponse(
                question.question,
                question.answer,
                submitted
            )

            feedback[questionNo] = result.feedback

            if (!result.correct) {
                wrong.push(questionNo)
            }
        } else {
            // multiple choice: compare submitted option id to the correct option
            const correctOption = question.options.find((option) => option.correct)

            if (!correctOption || submitted !== correctOption.id) {
                wrong.push(questionNo)
            }
        }
    }

    // if some are wrong, return wrong questions and feedback back to the user.
    if (wrong.length > 0) {
        // currently logging whenever the user fails questions and which q numbers,
        // might be changed in the future, however this is to see if users,
        // are guessing questions, or if they need to be taught with material.
        await Up.ingest({
            title: `@${session.user.username} failed the ${id} quiz`,
            icon: "❌",
            data: {
                session,
                quizId: id,
                wrong,
                feedback,
            },
        })

        // return the wrong question numbers and feedback to the user.
        return NextResponse.json(
            { success: false, wrong, feedback },
            { status: 400 }
        )
    }

    // give xp that the quiz gives.
    await addXP(session.user.username, quiz.xp)

    // log that the user has passed the quiz,
    // will prob remove in the future as it eats up
    // my Upstream events quota
    await Up.ingest({
        title: `@${session.user.username} passed the ${id} quiz`,
        icon: "✅",
    })

    // after, we need to check if the user has unlocked the module (e.g. posting, commenting),
    // if not, unlock it for the user.
    if (id == "post") {
        if (!session.user.unlockedPosting) {
            await unlockPosting(session.user.username)
            await Up.ingest({
                title: `@${session.user.username} unlocked the posting module`,
                icon: "🔓",
            })
            await NotificationService.send(
                session.user.id,
                "quacky",
                `Hey!\n\nAfter successfully completing the quiz, you have unlocked the posting module! You can now post things on Quacky!\n\nBefore you post, please read our [community guidelines](${env.BETTER_AUTH_URL}/legal/terms) to ensure your posts are appropriate and safe for the community.\n\nThe Quacky Team`
            )
        }
    } else if (id == "comment") {
        if (!session.user.unlockedCommenting) {
            await unlockCommenting(session.user.username)
            await Up.ingest({
                title: `@${session.user.username} unlocked the commenting module`,
                icon: "🔓",
            })
            await NotificationService.send(
                session.user.id,
                "quacky",
                `Hey!\n\nAfter successfully completing the quiz, you have unlocked the commenting module! You can now comment on posts!\n\nBefore you comment, please read our [community guidelines](${env.BETTER_AUTH_URL}/legal/terms) to ensure your comments are appropriate and safe for the community.\n\nThe Quacky Team`
            )
        }
    } else if (id == "dms") {
        if (!session.user.unlockedDms) {
            await unlockDms(session.user.username)
            await Up.ingest({
                title: `@${session.user.username} unlocked the direct messages module`,
                icon: "🔓",
            })
            await NotificationService.send(
                session.user.id,
                "quacky",
                `Hey!\n\nAfter successfully completing the quiz, you have unlocked the direct messages module! You can now send direct messages to other users.\n\nBefore you send a message, please read our [community guidelines](${env.BETTER_AUTH_URL}/legal/terms) to ensure your messages are appropriate and safe for the community.\n\nThe Quacky Team`
            )
        }
    } else if (id == "profiles") {
        if (!session.user.unlockedProfiles) {
            await unlockProfiles(session.user.username)
            await Up.ingest({
                title: `@${session.user.username} unlocked the profiles module`,
                icon: "🔓",
            })
            await NotificationService.send(
                session.user.id,
                "quacky",
                `Hey!\n\nAfter successfully completing the quiz, you have unlocked the profiles module! You can now view other users' profiles.\n\nBefore you view profiles, please read our [community guidelines](${env.BETTER_AUTH_URL}/legal/terms) to ensure your actions are appropriate and safe for the community.\n\nThe Quacky Team`
            )
        }
    } else if (id == "fuzzies") {
        if (!session.user.unlockedFuzzies) {
            await unlockFuzzies(session.user.username)
            await Up.ingest({
                title: `@${session.user.username} unlocked the fuzzies module`,
                icon: "🔓",
            })
            await NotificationService.send(
                session.user.id,
                "quacky",
                `Hey!\n\nAfter successfully completing the quiz, you have unlocked the fuzzies module! You can now send fuzzies to other users.\n\nBefore you send a fuzzy, please read our [community guidelines](${env.BETTER_AUTH_URL}/legal/terms) to ensure your fuzzies are appropriate and safe for the community.\n\nThe Quacky Team`
            )
        }
    }

    return NextResponse.json(
        {
            success: true,
        },
        {
            status: 200,
        }
    )
}
