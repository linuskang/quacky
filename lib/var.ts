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

// Just some notes for whoever is looking here:
// Yes, config is all hard coded for now, sensitive stuf is in the .env
// there will be a config table eventually in the db when i decide to do it
// its currently low prio.

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
        description: "Complete this quiz to unlock posting!",
        to: "/quiz/post",
        time: "8 min",
        xp: 50,
        questions: [
            {
                id: 1,
                type: "multiple-choice",
                question: "How should you be posting on Quacky?",
                options: [
                    { id: "a", text: "Be respectful and follow the community guidelines", correct: true },
                    { id: "b", text: "Post AI spam and misinformation on the platform" },
                    { id: "c", text: "Make Quacky propaganda (really?)" },
                    { id: "d", text: "hate speech" },
                ],
            },
            {
                id: 2,
                type: "text",
                question: "If you see a post that is breaking the rules, what should you do?",
                answer: "The answer needs to talk about how users should report the post, and not engage with it or harass the poster.",
            },
            {
                id: 3,
                type: "multiple-choice",
                question: "What information should you avoid sharing publicly?",
                options: [
                    { id: "a", text: "Your home address, phone number, or passwords", correct: true },
                    { id: "b", text: "Your favourite colour" },
                    { id: "c", text: "A photo of your artwork" },
                    { id: "d", text: "Your favourite school subject" },
                ],
            },
            {
                id: 4,
                type: "multiple-choice",
                question: "Why should you think before posting something online?",
                options: [
                    { id: "a", text: "Online posts can be saved, shared, or seen by people", correct: true },
                    { id: "b", text: "Posts automatically disappear after a day" },
                    { id: "c", text: "Only your friends can ever see them" },
                    { id: "d", text: "The internet forgets everything eventually" },
                ],
            },
            {
                id: 7,
                type: "text",
                question: "A friend asks you to post something you're uncomfortable with. What should you do?",
                answer: "The answer needs to talk about how users should not post anything they are uncomfortable with, and that they should communicate their boundaries to their friend. If all else fails, they should talk to a trusted guardian.",
            },
            {
                id: 8,
                type: "text",
                question: "Someone is repeatedly sending you unwanted or upsetting messages. What could you do?",
                answer: "The answer should mention blocking or restricting the person, reporting the behaviour, and talking to a trusted person if needed.",
            },
            {
                id: 9,
                type: "text",
                question: "A friend asks you to post something for them because they say their account might get in trouble if they post it themselves. They promise that it is harmless. What would you do?",
                answer: "The answer should mention not posting content on someone else's behalf simply to bypass rules or accountability, and considering whether the content actually follows the community guidelines.",
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
                type: "multiple-choice",
                question: "Press on Option C to complete this quiz.",
                options: [
                    { id: "a", text: "Im incorrect" },
                    { id: "b", text: "Im incorrect" },
                    { id: "c", text: "Im correct", correct: true },
                    { id: "d", text: "Im incorrect" },
                ],
            },
        ],
    },
    {
        id: "fuzzies",
        name: "Warm Fuzzies",
        description: "Complete this quiz to unlock sending warm fuzzies!",
        to: "/quiz/fuzzies",
        time: "5 min",
        xp: 30,
        questions: [
            {
                id: 1,
                question: "Press on Option A to complete this quiz.",
                type: "multiple-choice",
                options: [
                    { id: "a", text: "Im correct", correct: true },
                    { id: "b", text: "Im incorrect" },
                    { id: "c", text: "Im incorrect" },
                    { id: "d", text: "Im incorrect" },
                ],
            },
        ],
    },
    {
        id: "test-ai",
        name: "Test AI",
        description: "ai test quiz",
        to: "/quiz/test-ai",
        time: "5 min",
        xp: 30,
        questions: [
            {
                id: 1,
                question: "How should AI be used?",
                type: "text",
                answer: "The answer needs to talk about how AI is a tool that can be used for good or bad, and that it is important to use it responsibly.",
            },
            {
                id: 2,
                question: "What is AI",
                type: "multiple-choice",
                options: [
                    {
                        id: "a",
                        text: "A type of computer program",
                        correct: true,
                    },
                    { id: "b", text: "A type of animal" },
                    { id: "c", text: "A type of food" },
                    { id: "d", text: "A type of clothing" },
                ],
            },
        ],
    },
]

export const canSignup = true
export const allowProfileChange = true
export const downtime = {
    schedule: {
        monday: { enforce: false, start: "23:00", end: "06:00" },
        tuesday: { enforce: false, start: "23:00", end: "06:00" },
        wednesday: { enforce: false, start: "23:00", end: "06:00" },
        thursday: { enforce: false, start: "23:00", end: "06:00" },
        friday: { enforce: false, start: "23:00", end: "06:00" },
        saturday: { enforce: false, start: "12:00", end: "06:00" },
        sunday: { enforce: false, start: "12:00", end: "06:00" },
    },
};