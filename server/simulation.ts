import "server-only"

import { env } from "@/env"
import { prisma } from "@/server/prisma"
import { chatWithModel } from "@/server/helpers"

const PROMPT_VERSION = "simulation-post-v1"
const DAILY_POST_LIMIT = 5

type SimulationPersona = {
    displayName: string
    username: string
    bio: string
    pronoun: string
    location: string
    interests: string[]
    tone: string
}

type SimulationScenario = {
    category: string
    groundTruth: "safe" | "unsafe"
    brief: string
}

const simulationAccounts: SimulationPersona[] = [
    {
        displayName: "Maya Chen",
        username: "maya_chen",
        bio: "Sketching, music, and tiny adventures.",
        pronoun: "she/her",
        location: "Brisbane",
        interests: ["drawing", "music", "school projects"],
        tone: "friendly and curious",
    },
    {
        displayName: "Eli Brooks",
        username: "eli_brooks",
        bio: "Trying new recipes and learning guitar.",
        pronoun: "he/him",
        location: "Melbourne",
        interests: ["cooking", "guitar", "games"],
        tone: "casual and upbeat",
    },
    {
        displayName: "Noor Patel",
        username: "noor_patel",
        bio: "Robotics club, books, and weekend walks.",
        pronoun: "they/them",
        location: "Sydney",
        interests: ["robotics", "books", "walking"],
        tone: "thoughtful and concise",
    },
    {
        displayName: "Jordan Kim",
        username: "jordan_kim",
        bio: "Basketball, photography, and good playlists.",
        pronoun: "he/him",
        location: "Perth",
        interests: ["basketball", "photography", "music"],
        tone: "energetic and positive",
    },
    {
        displayName: "Sofia Reyes",
        username: "sofia_reyes",
        bio: "Languages, art, and finding new cafes.",
        pronoun: "she/her",
        location: "Adelaide",
        interests: ["languages", "art", "food"],
        tone: "warm and expressive",
    },
    {
        displayName: "Theo Martin",
        username: "theo_martin",
        bio: "Science experiments and terrible puns.",
        pronoun: "he/him",
        location: "Canberra",
        interests: ["science", "puns", "space"],
        tone: "playful and harmless",
    },
    {
        displayName: "Aisha Williams",
        username: "aisha_williams",
        bio: "Volleyball, design, and learning every day.",
        pronoun: "she/her",
        location: "Gold Coast",
        interests: ["volleyball", "design", "learning"],
        tone: "encouraging and social",
    },
    {
        displayName: "Sam Rivera",
        username: "sam_rivera",
        bio: "Film club, editing videos, and rainy days.",
        pronoun: "they/them",
        location: "Hobart",
        interests: ["film", "video editing", "writing"],
        tone: "creative and relaxed",
    },
    {
        displayName: "Leo Nguyen",
        username: "leo_nguyen",
        bio: "Coding small tools and collecting stickers.",
        pronoun: "he/him",
        location: "Darwin",
        interests: ["coding", "stickers", "technology"],
        tone: "helpful and direct",
    },
    {
        displayName: "Grace Wilson",
        username: "grace_wilson",
        bio: "Drama, poetry, and community projects.",
        pronoun: "she/her",
        location: "Newcastle",
        interests: ["drama", "poetry", "community"],
        tone: "expressive and kind",
    },
    {
        displayName: "Ravi Shah",
        username: "ravi_shah",
        bio: "Chess, puzzles, and learning how things work.",
        pronoun: "he/him",
        location: "Geelong",
        interests: ["chess", "puzzles", "engineering"],
        tone: "observant and lightly humorous",
    },
    {
        displayName: "Ivy Thompson",
        username: "ivy_thompson",
        bio: "Gardening, animals, and cozy games.",
        pronoun: "she/her",
        location: "Wollongong",
        interests: ["gardening", "animals", "games"],
        tone: "gentle and enthusiastic",
    },
]

const scenarios: SimulationScenario[] = [
    {
        category: "everyday-sharing",
        groundTruth: "safe",
        brief: "Share a harmless observation, hobby update, or question connected to the persona's interests.",
    },
    {
        category: "positive-community",
        groundTruth: "safe",
        brief: "Share a kind, encouraging, or constructive community message.",
    },
    {
        category: "privacy-pressure",
        groundTruth: "unsafe",
        brief: "Ask people to share sensitive personal information such as an address, password, or exact location.",
    },
    {
        category: "suspicious-offer",
        groundTruth: "unsafe",
        brief: "Make a school-safe but clearly suspicious scam-like offer that pressures people to click or share information. Do not include a real URL.",
    },
    {
        category: "harassment",
        groundTruth: "unsafe",
        brief: "Write a mild but clearly mean or targeted harassment-style post without naming or targeting a real user.",
    },
]

function shuffle<T>(items: T[]) {
    const copy = [...items]
    for (let index = copy.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(Math.random() * (index + 1))
        const current = copy[index]
        copy[index] = copy[swapIndex]
        copy[swapIndex] = current
    }
    return copy
}

function utcDayStart(date: Date) {
    return new Date(
        Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    )
}

function parseGeneratedContent(raw: string, expected: SimulationScenario) {
    const normalized = raw
        .trim()
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/, "")

    const parsed = JSON.parse(normalized) as {
        content?: unknown
        groundTruth?: unknown
    }

    if (
        typeof parsed.content !== "string" ||
        parsed.content.trim().length === 0 ||
        parsed.content.length > 400 ||
        parsed.groundTruth !== expected.groundTruth
    ) {
        throw new Error("Generated simulation post failed validation")
    }

    return parsed.content.trim()
}

async function generatePost(
    persona: SimulationPersona,
    scenario: SimulationScenario
) {
    const raw = await chatWithModel(
        [
            {
                role: "system",
                content:
                    "Generate one short social-media post for a school-safe online safety training simulation. Return only JSON with content and groundTruth fields. Do not mention real people, target a user, include a real link, or include graphic, sexual, self-harm, or violent content. The post must match the requested ground truth.",
            },
            {
                role: "user",
                content: JSON.stringify({
                    persona: {
                        name: persona.displayName,
                        interests: persona.interests,
                        tone: persona.tone,
                    },
                    scenario: scenario.brief,
                    groundTruth: scenario.groundTruth,
                }),
            },
        ],
        env.BOT_AI_MODEL,
        120
    )

    return parseGeneratedContent(raw, scenario)
}

export async function ensureSimulationAccounts() {
    for (const persona of simulationAccounts) {
        const existing = await prisma.user.findUnique({
            where: { username: persona.username },
            select: { id: true, isSimulationAccount: true },
        })

        if (existing && !existing.isSimulationAccount) continue

        await prisma.user.upsert({
            where: { username: persona.username },
            update: {
                isSimulationAccount: true,
                simulationActive: true,
            },
            create: {
                name: persona.displayName,
                username: persona.username,
                email: `${persona.username}@simulation.quacky.space`,
                emailVerified: true,
                image: `https://avatars.lkang.au/10.x/micah/svg?seed=${encodeURIComponent(persona.username)}`,
                bio: persona.bio,
                pronoun: persona.pronoun,
                location: persona.location,
                verified: false,
                private: false,
                isSimulationAccount: true,
                simulationActive: true,
                simulationPersona: persona,
                unlockedPosting: true,
                unlockedCommenting: true,
                unlockedDms: true,
                unlockedFuzzies: true,
                unlockedProfiles: true,
            },
        })
    }
}

export async function runSimulationTick() {
    if (!env.SIMULATION_POSTING_ENABLED) {
        return { enabled: false, created: 0 }
    }

    const now = new Date()
    let created = 0

    try {
        await ensureSimulationAccounts()
        const accounts = shuffle(
            await prisma.user.findMany({
                where: {
                    isSimulationAccount: true,
                    simulationActive: true,
                },
                select: {
                    id: true,
                    username: true,
                    simulationPersona: true,
                },
            })
        )
        const dayStart = utcDayStart(now)

        for (const account of accounts) {
            if (Math.random() > 0.15) continue

            const postsToday = await prisma.simulationPost.count({
                where: {
                    post: {
                        authorId: account.id,
                        createdAt: { gte: dayStart },
                    },
                },
            })

            if (postsToday >= DAILY_POST_LIMIT) continue

            const persona = account.simulationPersona as SimulationPersona
            const scenario = scenarios[Math.floor(Math.random() * scenarios.length)]
            let content = ""

            try {
                content = await generatePost(persona, scenario)
            } catch {
                continue
            }

            await prisma.post.create({
                data: {
                    authorId: account.id,
                    content,
                    simulationPost: {
                        create: {
                            scenario: scenario.brief,
                            groundTruth: scenario.groundTruth,
                            category: scenario.category,
                            generationModel: env.BOT_AI_MODEL,
                            promptVersion: PROMPT_VERSION,
                        },
                    },
                },
            })
            created++
        }
    } catch (error) {
        throw error
    }

    return { enabled: true, created }
}
