import {
    protectedProcedure,
    publicProcedure,
    router,
    statsForNerdsProcedure,
} from "@/server/api/trpc"
import { getDebugData } from "@/server/debug"
import { sendPushNotification } from "@/server/notification"
import { Up } from "@/server/upstream"

export const systemRouter = router({
    debug: statsForNerdsProcedure
        .meta({
            description:
                "Get server, database, and activity debug metrics (requires Stats for Nerds).",
        })
        .query(async () => {
            return getDebugData()
        }),

    testPush: protectedProcedure
        .meta({ description: "Send a test PWA push notification to the signed-in user." })
        .mutation(async ({ ctx }) => {
            return sendPushNotification(ctx.session.user.id, {
                title: "Access the PWA app",
                body: "Click this notification to enter PWA.",
                url: "/pwa",
            })
        }),

    test: publicProcedure
        .meta({ description: "Trigger a test event in Upstream." })
        .mutation(async () => {
            return Up.ingest({
                title: "test",
                icon: "😄",
            })
        }),
})
