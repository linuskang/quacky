import { initTRPC } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import { auth } from "@/server/auth";

export async function createTRPCContext({ req }: { req: Request }) {
    const session = await auth.api.getSession({
        headers: req.headers,
    });

    return { session };
}

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<Context>().create();

export const router = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
    if (!ctx.session) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return next({
        ctx: {
            session: ctx.session,
        },
    });
});
