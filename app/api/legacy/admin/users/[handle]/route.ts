import { getSession } from "@/server/auth"
import { getUser } from "@/server/users"
import { Response } from "@/lib/responses"
import { NextRequest } from "next/server"
import { prisma } from "@/server/prisma"
import { Up } from "@/server/upstream"
import { z } from "zod"

const nullableText = z.preprocess(
    (value) => value === "" ? null : value,
    z.string().trim().nullable()
)

const nullableDate = z.preprocess(
    (value) => value === "" ? null : value,
    z.coerce.date().nullable()
)

const userUpdateSchema = z.object({
    name: z.string().trim().min(1),
    username: z.string().trim().min(1),
    email: z.email(),
    emailVerified: z.boolean(),
    image: z.string().trim().min(1),
    verified: z.boolean(),
    statsForNerds: z.boolean(),
    private: z.boolean(),
    streamerMode: z.boolean(),
    hideTips: z.boolean(),
    bio: nullableText,
    bannerImage: nullableText,
    pronoun: nullableText,
    location: nullableText,
    website: nullableText,
    role: nullableText,
    banned: z.boolean().nullable(),
    banReason: nullableText,
    banExpires: nullableDate,
    parentEmail: nullableText,
    unlockedPosting: z.boolean(),
    unlockedCommenting: z.boolean(),
    unlockedDms: z.boolean(),
    unlockedFuzzies: z.boolean(),
    unlockedProfiles: z.boolean(),
    xp: z.number().int().min(0),
    points: z.number().int().min(0),
    pushNotificationsEnabled: z.boolean(),
})

type UserUpdate = z.infer<typeof userUpdateSchema>

function auditValue(value: unknown) {
    if (value instanceof Date) return value.toISOString()
    return value ?? null
}

export async function GET(request: NextRequest, { params }: {
    params: Promise<{ handle: string }>
}) {
    void request
    const session = await getSession()

    if (!session) return Response.Unauthorized()
    if (session.user.role !== "admin") return Response.Forbidden()

    const { handle } = await params
    const user = await getUser(handle)

    if (!user) return Response.NotFound()

    return Response.Success(user)
}

export async function PATCH(request: NextRequest, { params }: {
    params: Promise<{ handle: string }>
}) {
    const session = await getSession()

    if (!session) return Response.Unauthorized()
    if (session.user.role !== "admin") return Response.Forbidden()

    const { handle } = await params
    const parsed = userUpdateSchema.safeParse(await request.json())

    if (!parsed.success) return Response.BadRequest("Invalid user update")

    const existing = await prisma.user.findUnique({ where: { username: handle } })
    if (!existing) return Response.NotFound()

    const data = parsed.data as UserUpdate
    const changes = Object.fromEntries(
        Object.keys(data)
            .filter((key) => {
                const field = key as keyof UserUpdate
                return auditValue(existing[field]) !== auditValue(data[field])
            })
            .map((key) => {
                const field = key as keyof UserUpdate
                return [
                    key,
                    { old: auditValue(existing[field]), new: auditValue(data[field]) },
                ]
            })
    )

    if (Object.keys(changes).length === 0) {
        return Response.Success(existing)
    }

    const user = await prisma.user.update({
        where: { id: existing.id },
        data,
    })

    await Up.ingest({
        title: "Admin updated user",
        description: `${session.user.name} updated ${user.username}.`,
        icon: "🛠️",
        category: "admin.user.updated",
        fields: [
            { title: "User", value: `${user.name} (@${user.username})` },
            { title: "Changed fields", value: Object.keys(changes).join(", ") },
            { title: "Admin", value: session.user.email },
        ],
        data: {
            adminId: session.user.id,
            targetUserId: user.id,
            targetUsername: user.username,
            changes,
        },
    })

    return Response.Success(user)
}
