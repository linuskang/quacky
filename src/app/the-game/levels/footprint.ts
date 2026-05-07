import type { Level } from './types';

export const footprintLevels: Level[] = [
    {
        id: 'footprint-1',
        worldId: 'footprint',
        number: 1,
        title: 'The Job Application',
        subtitle: 'Your employer is searching your name.',
        intro: [
            { text: "You're 17 and applying for your first part-time job. The interviewer Googles your name." },
            { text: "Which of your old posts would make them think twice about hiring you? Swipe RIGHT for fine, LEFT for risky." },
        ],
        challenge: {
            type: 'swipe',
            instruction: "Would this post be fine for a future employer to see?",
            labelRight: 'FINE',
            labelLeft: 'RISKY',
            items: [
                {
                    id: 'f1',
                    post: {
                        username: 'your_account',
                        handle: '@you',
                        avatar: '😊',
                        content: "Can't wait for the school sports carnival tomorrow!! Go Red Team!! 🏃‍♀️🔴",
                        time: '2 years ago',
                        likes: 14,
                        reposts: 2,
                    },
                    isReal: true,
                    explanation: "✅ Fine. Positive, innocent school content. This actually shows you're engaged and enthusiastic — no red flags.",
                },
                {
                    id: 'f2',
                    post: {
                        username: 'your_account',
                        handle: '@you',
                        avatar: '😤',
                        content: "this teacher is an absolute idiot and I genuinely hate this class so much, I can't wait to be done",
                        time: '1 year ago',
                        likes: 8,
                        reposts: 1,
                    },
                    isReal: false,
                    explanation: "❌ Risky. Publicly criticising authority figures is a major red flag for employers. It signals you might do the same about your manager.",
                },
                {
                    id: 'f3',
                    post: {
                        username: 'your_account',
                        handle: '@you',
                        avatar: '🐶',
                        content: "Spent Saturday volunteering at the local animal shelter! Really great to give back to the community 🐾",
                        time: '8 months ago',
                        likes: 62,
                        reposts: 5,
                    },
                    isReal: true,
                    explanation: "✅ Fine — and actually great. Community involvement and positive content can genuinely help your application.",
                },
                {
                    id: 'f4',
                    post: {
                        username: 'your_account',
                        handle: '@you',
                        avatar: '😂',
                        content: 'lol skipped school today, nobody even noticed 😂😂 #yolo #freedom',
                        time: '6 months ago',
                        likes: 11,
                        reposts: 3,
                    },
                    isReal: false,
                    explanation: "❌ Risky. Bragging about skipping school signals unreliability and lack of responsibility — both huge concerns for a potential employer.",
                },
            ],
        },
        lesson: "Before posting, ask: 'Would I be OK if a future employer saw this forever?' Because online, posts outlive the moment you made them.",
        successMessage: "Your digital footprint awareness is solid!",
    },
    {
        id: 'footprint-2',
        worldId: 'footprint',
        number: 2,
        title: 'The Delete Button',
        subtitle: "Deleted doesn't mean gone.",
        intro: [
            { text: "You posted something cringy last year. You've deleted it from Quacky. Phew, right?" },
            { text: "Or… is it actually gone? Let's think about this." },
        ],
        challenge: {
            type: 'choice',
            situation: "'I deleted the post — it's completely gone now, right? No one can ever see it again?' What's the reality?",
            options: [
                {
                    id: 'a',
                    text: "Yes — deleted means deleted. It's gone forever.",
                    correct: false,
                    outcome: "Not quite. Once something is posted online, others could have screenshotted it, search engines may have cached it, and the platform may retain it on their servers. 🗃️",
                },
                {
                    id: 'b',
                    text: "It's gone from Quacky, but screenshots and caches might still exist.",
                    correct: true,
                    outcome: "Exactly. Deleting removes the public post, but copies can live in screenshots, Google's cache, Wayback Machine snapshots, and platform backups. That's why you should think before you post. ✅",
                },
                {
                    id: 'c',
                    text: "It's still visible to everyone — deleting does nothing.",
                    correct: false,
                    outcome: "Deleting does help — the post is removed from the platform's public view. But digital copies may still exist elsewhere. The point is: it's never 100% gone.",
                },
                {
                    id: 'd',
                    text: "Only your followers still have a copy.",
                    correct: false,
                    outcome: "Screenshots can be with anyone who saw the post — not just followers. And automated tools can archive public posts before you delete them.",
                },
            ],
        },
        lesson: "Before posting, ask: 'Would I be OK if this existed permanently?' Because online, 'deleted' is never truly permanent. Think before you post — you can't un-ring that bell.",
        successMessage: "You understand the permanent nature of the internet.",
    },
];
