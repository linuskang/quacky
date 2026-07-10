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

export const version = "0.2.0"

export const rules = [
    {
        title: "Be respectful",
        description:
            "Treat others the way you want to be treated. Harassment, bullying, and hate speech are not tolerated on Quacky.",
    },
    {
        title: "No spam",
        description:
            "Do not post repetitive content, unsolicited promotions, or engage in coordinated inauthentic behaviour.",
    },
    {
        title: "No NSFW or inappropriate content",
        description:
            "Sexually explicit, pornographic, or sexually suggestive content is strictly prohibited.",
    },
    {
        title: "Do not share misinformation",
        description:
            "Do not share content that is widely known to be false or misleading, especially on health, safety, or political topics.",
    },
    {
        title: "Respect other's IP",
        description:
            "Credit creators when sharing their work. Do not claim others' content as your own.",
    },
    {
        title: "Respect other user's privacy",
        description:
            "Do not share personal information about others without their consent. No doxxing, surveillance, or stalking.",
    },
]

export const xp = {
    post: 10, //
    comment: 5, //
    like: 1, //
    follow: 5, //
    report: 1, //
    checkIn: 15,
}

export const quizes = [
    {
        id: "post",
        name: "Posting",
        description:
            "Complete this quiz to unlock posting!",
        to: "/quiz/post",
        time: "8 min",
        xp: 50,
        questions: [
            {
                id: 1,
                question: "Press on Option B to complete this quiz.",
                options: [
                    { id: "a", text: "Im incorrect" },
                    { id: "b", text: "Im correct", correct: true },
                    { id: "c", text: "Im incorrect" },
                    { id: "d", text: "Im incorrect" },
                ],
            },
        ],
    },
    {
        id: "comment",
        name: "Commenting",
        description: "Complete this quiz to unlock commenting!",
        to: "/quiz/comment",
        time: "5 min",
        xp: 30,
        questions: [
            {
                id: 1,
                question: "Press on Option C to complete this quiz.",
                options: [
                    { id: "a", text: "Im incorrect" },
                    { id: "b", text: "Im incorrect" },
                    { id: "c", text: "Im correct", correct: true },
                    { id: "d", text: "Im incorrect" },
                ],
            }
        ]
    }
]
