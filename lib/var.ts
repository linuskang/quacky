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

export const version = "0.0.6"

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
        theory: `
## Posting safely on social media

Social media is a public or semi-public space, so posts should be respectful, honest, and safe for other people to read. Different platforms have different rules, but the same basic safety habits apply everywhere.

### Before you post

- Follow the platform's community guidelines.
- Avoid sharing private information such as your address, phone number, or passwords.
- Remember that posts can be saved, shared, or seen by people outside your intended audience.
- Only post things you are comfortable having associated with you.
- Check that photos and information about other people are okay to share before posting them.

If a post breaks the rules, report it through the platform's reporting tools instead of engaging with or harassing the person who made it. If someone pressures you to post something uncomfortable, set a boundary and talk to a trusted adult if you need help.
`,
        to: "/quiz/post",
        time: "8 min",
        xp: 50,
        questions: [
            {
                id: 1,
                type: "multiple-choice",
                question: "How should you be posting on social media?",
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
                id: 5,
                type: "multiple-choice",
                question: "What is a good first step if someone pressures you to post something uncomfortable?",
                options: [
                    { id: "a", text: "Set a boundary and say that you do not want to post it", correct: true },
                    { id: "b", text: "Post it immediately so nobody gets upset" },
                    { id: "c", text: "Share the person's private information" },
                    { id: "d", text: "Pretend it never happened and keep engaging" },
                ],
            },
            {
                id: 6,
                type: "text",
                question: "What makes a post respectful and safe for other people?",
                answer: "The answer should explain that a respectful and safe post follows the community guidelines, avoids harassment or hateful content, and does not share private information.",
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
                type: "multiple-choice",
                question: "What should you consider before sharing a photo of someone else?",
                options: [
                    { id: "a", text: "Whether you have their permission and the photo is appropriate", correct: true },
                    { id: "b", text: "Whether the photo will make them embarrassed" },
                    { id: "c", text: "Nothing, because photos are always safe to share" },
                    { id: "d", text: "Whether you can hide the post from everyone" },
                ],
            },
            {
                id: 10,
                type: "text",
                question: "How could you respond to someone you disagree with without starting a fight?",
                answer: "The answer should describe staying respectful, discussing the idea instead of attacking the person, and stepping away or reporting the conversation if it becomes harmful.",
            },
        ],
    },
    {
        id: "comment",
        name: "Commenting",
        description: "Complete this quiz to unlock commenting!",
        theory: `
## Commenting responsibly

Comments should add to the conversation without attacking or harassing other people.

Before commenting, consider whether your words are respectful and relevant. Disagreement is okay, but personal attacks, hate speech, spam, and misinformation are not.
`,
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
        theory: `
## Sending warm fuzzies

Warm fuzzies are a way to make someone feel appreciated. Send them when you have something kind or encouraging to say.

Keep your message respectful and appropriate for the person receiving it. Do not use warm fuzzies to pressure, embarrass, or bother someone.
`,
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
        theory: `
## Using AI responsibly

AI is a tool. It can be useful for learning, brainstorming, and creating, but it can also make mistakes or produce harmful content.

Use your judgment, check important information, and take responsibility for anything you submit or share. Do not treat an AI response as automatically correct.
`,
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
