import { initTRPC, TRPCError } from "@trpc/server"

import { auth } from "@/server/auth"

export type TRPCAuthTier =
    | "public"
    | "session"
    | "admin"
    | "unlocked:posting"
    | "unlocked:commenting"
    | "unlocked:dms"
    | "unlocked:fuzzies"
    | "statsForNerds"

export type TRPCMeta = {
    description?: string
    auth?: TRPCAuthTier
    contentType?: "application/json" | "multipart/form-data"
}

export async function createTRPCContext({ req }: { req: Request }) {
    const session = await auth.api.getSession({
        headers: req.headers,
    })

    return {
        session,
        headers: req.headers,
    }
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>

const t = initTRPC.context<Context>().meta<TRPCMeta>().create()

export const router = t.router
export const createCallerFactory = t.createCallerFactory

export const publicProcedure = t.procedure.meta({ auth: "public" })

export const protectedProcedure = t.procedure
    .meta({ auth: "session" })
    .use(({ ctx, next }) => {
        if (!ctx.session) {
            throw new TRPCError({
                code: "UNAUTHORIZED",
                message: "Unauthorized",
            })
        }

        return next({
            ctx: {
                ...ctx,
                session: ctx.session,
            },
        })
    })

export const adminProcedure = protectedProcedure
    .meta({ auth: "admin" })
    .use(({ ctx, next }) => {
        if (ctx.session.user.role !== "admin") {
            throw new TRPCError({
                code: "FORBIDDEN",
                message: "You do not have permission to use this resource",
            })
        }

        return next({ ctx })
    })

export const postingProcedure = protectedProcedure
    .meta({ auth: "unlocked:posting" })
    .use(({ ctx, next }) => {
        if (!ctx.session.user.unlockedPosting) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message:
                    "Posting is locked for your account. Please complete the quiz at /quiz/post to unlock posting!",
            })
        }

        return next({ ctx })
    })

export const dmsProcedure = protectedProcedure
    .meta({ auth: "unlocked:dms" })
    .use(({ ctx, next }) => {
        if (!ctx.session.user.unlockedDms) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message:
                    "Direct messages are locked, please complete the DMs Quiz to unlock them.",
            })
        }

        return next({ ctx })
    })

export const fuzziesProcedure = protectedProcedure
    .meta({ auth: "unlocked:fuzzies" })
    .use(({ ctx, next }) => {
        if (!ctx.session.user.unlockedFuzzies) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message:
                    "This feature is locked, please complete the Warm Fuzzies Quiz to unlock it.",
            })
        }

        return next({ ctx })
    })

export const statsForNerdsProcedure = protectedProcedure
    .meta({ auth: "statsForNerds" })
    .use(({ ctx, next }) => {
        if (!ctx.session.user.statsForNerds) {
            throw new TRPCError({
                code: "FORBIDDEN",
                message:
                    "To access this API, please enable 'Stats for Nerds' in your account settings to continue.",
            })
        }

        return next({ ctx })
    })
