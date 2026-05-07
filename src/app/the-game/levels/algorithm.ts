import type { Level } from './types';

export const algorithmLevels: Level[] = [
    {
        id: 'algorithm-1',
        worldId: 'algorithm',
        number: 1,
        title: 'The Rabbit Hole',
        subtitle: "Why does your feed feel like an echo chamber?",
        intro: [
            { text: "You clicked one video about a controversial topic. Now your entire feed is full of it — and the content is getting more and more extreme." },
            { text: "What's happening here, and what should you do?" },
        ],
        challenge: {
            type: 'choice',
            situation: "You watched one video arguing social media is harmful. Now every recommendation is a more extreme version of that argument. You feel more anxious each time. What's going on?",
            options: [
                {
                    id: 'a',
                    text: "The algorithm found what I like and is helpfully showing me more.",
                    correct: false,
                    outcome: "Partly true — but the algorithm isn't just personalising. It's optimising for watch time by showing increasingly extreme content. It doesn't care if the content is balanced or true. 📈",
                },
                {
                    id: 'b',
                    text: "The algorithm maximises watch time by pushing increasingly one-sided content.",
                    correct: true,
                    outcome: "Exactly. This is called a 'filter bubble' or 'rabbit hole'. The algorithm doesn't care about balance or your mental health — it cares about keeping you watching. ✅",
                },
                {
                    id: 'c',
                    text: "Someone is deliberately targeting me with propaganda.",
                    correct: false,
                    outcome: "Usually not personal targeting — but the effect can feel that way. It's an automated optimisation system, not a person picking on you. Still harmful though.",
                },
                {
                    id: 'd',
                    text: "This is just a coincidence.",
                    correct: false,
                    outcome: "Not a coincidence at all. Recommendation algorithms are one of the most studied and engineered features of modern social media. This is very deliberate design.",
                },
            ],
        },
        lesson: "Algorithms prioritise engagement over accuracy or balance. Counter this: deliberately follow diverse viewpoints, clear your watch history, and search for topics outside your usual interests.",
        successMessage: "You've seen through the algorithm's design.",
    },
    {
        id: 'algorithm-2',
        worldId: 'algorithm',
        number: 2,
        title: 'The Streak',
        subtitle: "Artificial urgency is a design pattern.",
        intro: [
            { text: "It's 11pm. You have school tomorrow. You haven't opened the app today." },
            { text: "A notification buzzes: 'Don\'t lose your 47-day streak! You have 1 hour left!' 😰" },
        ],
        challenge: {
            type: 'choice',
            situation: "You're tired and ready for bed. But your 47-day streak will reset tonight if you don't log in. What do you do?",
            options: [
                {
                    id: 'a',
                    text: "Log in just for a second to keep the streak, then immediately close the app.",
                    correct: false,
                    outcome: "Even opening 'just for a second' usually leads to 20 more minutes of scrolling. The streak notification is designed to create this exact situation. 📱⏳",
                },
                {
                    id: 'b',
                    text: "Ignore it — your streak is a number that only exists inside the app.",
                    correct: true,
                    outcome: "You've seen through the design pattern. Streaks are manufactured urgency. Breaking a streak has literally zero real-world consequences. Get some sleep. ✅",
                },
                {
                    id: 'c',
                    text: "Feel guilty and spend an hour on the app to make up for it.",
                    correct: false,
                    outcome: "This is exactly what streaks are designed to make you do. The 'guilt' you feel was engineered by a product team to maximise time-in-app. You're not actually obligated to anything.",
                },
                {
                    id: 'd',
                    text: "Turn off all app notifications so this never happens again.",
                    correct: true,
                    outcome: "Solid move! Turning off non-essential notifications reduces the app's ability to manufacture urgency and pull you back in at bad times. Your phone, your rules. ✅",
                },
            ],
        },
        lesson: "Streaks, badges, and urgent notifications are design patterns built to maximise your time in-app. They create artificial anxiety about losing something that only exists inside the app. You can let the streak go.",
        successMessage: "You're in control of your phone — not the other way around.",
    },
];
