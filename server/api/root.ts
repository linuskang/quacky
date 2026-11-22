import { adminRouter } from "@/server/api/routers/admin"
import { commentsRouter } from "@/server/api/routers/comments"
import { dmsRouter } from "@/server/api/routers/dms"
import { fuzziesRouter } from "@/server/api/routers/fuzzies"
import { meRouter } from "@/server/api/routers/me"
import { memesRouter } from "@/server/api/routers/memes"
import { metaRouter } from "@/server/api/routers/meta"
import { postsRouter } from "@/server/api/routers/posts"
import { quizRouter } from "@/server/api/routers/quiz"
import { rngRouter } from "@/server/api/routers/rng"
import { shopRouter } from "@/server/api/routers/shop"
import { shortsRouter } from "@/server/api/routers/shorts"
import { systemRouter } from "@/server/api/routers/system"
import { uploadRouter } from "@/server/api/routers/upload"
import { usersRouter } from "@/server/api/routers/users"
import { createCallerFactory, router } from "@/server/api/trpc"

export const appRouter = router({
    meta: metaRouter,
    me: meRouter,
    posts: postsRouter,
    comments: commentsRouter,
    users: usersRouter,
    dms: dmsRouter,
    fuzzies: fuzziesRouter,
    memes: memesRouter,
    shorts: shortsRouter,
    quiz: quizRouter,
    rng: rngRouter,
    shop: shopRouter,
    upload: uploadRouter,
    admin: adminRouter,
    system: systemRouter,
})

export type AppRouter = typeof appRouter

export const createCaller = createCallerFactory(appRouter)
