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

import { quizes } from "@/lib/var";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/server/auth";
import { unlockPosting, unlockCommenting, unlockDms, unlockProfiles, unlockFuzzies } from "@/server/users";
import { Up } from "@/server/upstream";
import { addXP } from "@/server/users";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
        return new NextResponse(
            "Unauthorized",
            {
                status: 401
            }
        );
    }

    // find quiz by id in the array
    const quiz = quizes.find((q) => q.id === id);

    if (!quiz) {
        return new NextResponse(
            "Quiz not found",
            {
                status: 404
            }
        );
    }

    return NextResponse.json({
        questions: quiz.questions.map((question, index) => ({
            ...question,
            no: index + 1,
            options: question.options.map(({ correct, ...option }) => option),
        })),
        meta: {
            name: quiz.name,
            description: quiz.description
        }
    });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    const { id } = await params;

    if (!session) {
        return new NextResponse(
            "Unauthorized",
            {
                status: 401
            }
        );
    }

    const quiz = quizes.find((q) => q.id === id);

    if (!quiz) {
        return new NextResponse(
            "Quiz not found",
            {
                status: 404
            }
        );
    }

    let answers: Record<number, string>;
    try {
        answers = await req.json();
    } catch {
        return NextResponse.json(
            { success: false, error: "Invalid answers format" },
            { status: 400 }
        );
    }

    // array with just numbers.
    // e.g. [1,2,3] are incorrect
    const wrong: number[] = [];

    // for every question, check if answer is correct by comparing the submitted choice to answer guide in /lib/var.ts
    // for every question, (e.g. 5, run 5 times for each question indexed)
    for (let i = 0; i < quiz.questions.length; i++) {
        // array index number
        const question = quiz.questions[i];
        // plus 1 because our questions start at 1, and go up using
        // 1,2,3,4,5
        const questionNo = i + 1;
        // check the answer index submitted by question
        const submitted = answers[questionNo];
        //check if the indexed answer is the same as the array in var.ts
        const correctOption = question.options.find((option) => option.correct);

        // if its not correct, add it to the wrong array.
        if (!correctOption || submitted !== correctOption.id) {
            wrong.push(questionNo);
        }
    }

    // if some are wrong, return wrong questions back to the user.
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
                wrong
            }
        })

        // return the wrong question numbers to the user.
        return NextResponse.json(
            { success: false, wrong },
            { status: 400 }
        );
    }

    // give xp that the quiz gives.
    await addXP(
        session.user.username,
        quiz.xp
    )

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
            await unlockPosting(session.user.username);
            await Up.ingest({
                title: `@${session.user.username} unlocked the posting module`,
                icon: "🔓",
            })
        }
    } else if (id == "comment") {
        if (!session.user.unlockedCommenting) {
            await unlockCommenting(session.user.username);
            await Up.ingest({
                title: `@${session.user.username} unlocked the commenting module`,
                icon: "🔓",
            })
        }
    } else if (id == "dms") {
        if (!session.user.unlockedDms) {
            await unlockDms(session.user.username);
            await Up.ingest({
                title: `@${session.user.username} unlocked the direct messages module`,
                icon: "🔓",
            })
        }
    } else if (id == "profiles") {
        if (!session.user.unlockedProfiles) {
            await unlockProfiles(session.user.username);
            await Up.ingest({
                title: `@${session.user.username} unlocked the profiles module`,
                icon: "🔓",
            })
        }
    } else if (id == "fuzzies") {
        if (!session.user.unlockedFuzzies) {
            await unlockFuzzies(session.user.username);
            await Up.ingest({
                title: `@${session.user.username} unlocked the fuzzies module`,
                icon: "🔓",
            })
        }
    }

    return NextResponse.json({
        success: true
    }, {
        status: 200
    });
}