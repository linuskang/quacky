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
        id: "profiles",
        name: "Profile Basics",
        description: "Complete this quiz to unlock profile editing!",
        theory: `
## Building a safe profile

Your profile helps people know who they are interacting with, but you should still protect your privacy.

### Good profile habits

- Use a name, image, and bio that you are comfortable sharing.
- Do not include private information such as your home address, phone number, passwords, or exact daily routine.
- Only add links and details that are safe for other people to see.
- Be respectful and do not impersonate another person.
- If you change your mind, you can update or remove profile information later.

Think about who could see a profile before adding something to it. A profile should express who you are without revealing information that could put you or someone else at risk.
`,
        to: "/quiz/profiles",
        time: "6 min",
        xp: 40,
        questions: [
            {
                id: 1,
                type: "multiple-choice",
                question: "What is a good thing to include in a public profile?",
                options: [
                    { id: "a", text: "A hobby or interest you are comfortable sharing", correct: true },
                    { id: "b", text: "Your home address" },
                    { id: "c", text: "Your password" },
                    { id: "d", text: "Your exact daily schedule" },
                ],
            },
            {
                id: 2,
                type: "text",
                question: "What kinds of information should you avoid putting in a public profile, and why?",
                answer: "The answer should mention private or sensitive information such as an address, phone number, password, exact routine, or other details that could put someone at risk, and explain that public profiles can be seen by other people.",
            },
            {
                id: 3,
                type: "multiple-choice",
                question: "What should you do if you are no longer comfortable with something on your profile?",
                options: [
                    { id: "a", text: "Update or remove it", correct: true },
                    { id: "b", text: "Share even more private information" },
                    { id: "c", text: "Give your password to a friend" },
                    { id: "d", text: "Pretend you cannot change it" },
                ],
            },
            {
                id: 4,
                type: "text",
                question: "How can a profile express who you are while still protecting your privacy?",
                answer: "The answer should explain that users can share safe interests, hobbies, or general information while leaving out sensitive details such as their address, password, or exact routine.",
            },
            {
                id: 5,
                type: "multiple-choice",
                question: "Which profile behavior is respectful?",
                options: [
                    { id: "a", text: "Representing yourself honestly without impersonating someone else", correct: true },
                    { id: "b", text: "Using someone else's identity without permission" },
                    { id: "c", text: "Posting another person's private details" },
                    { id: "d", text: "Making a profile to harass someone" },
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
        id: "dms",
        name: "Direct Messages",
        description: "Complete this quiz to unlock direct messages!",
        theory: `
## Using direct messages safely

Direct messages are private conversations, but they still require care and respect.

- Do not share passwords, private addresses, or other sensitive information.
- Keep messages respectful and do not pressure people to reply or share things.
- If someone sends unwanted or upsetting messages, stop responding, block them, and report the conversation.
- Talk to a trusted person if a conversation makes you feel unsafe.

Remember that private does not always mean permanent or completely risk-free. Only send messages you are comfortable sharing with the recipient.
`,
        to: "/quiz/dms",
        time: "5 min",
        xp: 30,
        questions: [
            {
                id: 1,
                type: "multiple-choice",
                question: "What should you avoid sharing in a direct message?",
                options: [
                    { id: "a", text: "Your password or home address", correct: true },
                    { id: "b", text: "A friendly greeting" },
                    { id: "c", text: "A hobby you enjoy" },
                    { id: "d", text: "A message saying thank you" },
                ],
            },
            {
                id: 2,
                type: "text",
                question: "What could you do if someone repeatedly sends unwanted or upsetting direct messages?",
                answer: "The answer should mention stopping the conversation, blocking or restricting the person, reporting the messages, and talking to a trusted person if needed.",
            },
            {
                id: 3,
                type: "multiple-choice",
                question: "What is respectful behavior in a direct message conversation?",
                options: [
                    { id: "a", text: "Respecting boundaries and not pressuring someone to reply", correct: true },
                    { id: "b", text: "Sending messages repeatedly until they respond" },
                    { id: "c", text: "Sharing their private messages publicly" },
                    { id: "d", text: "Threatening someone who disagrees with you" },
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
