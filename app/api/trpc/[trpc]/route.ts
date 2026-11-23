import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";

const handler = (req: Request) =>
    fetchRequestHandler({
        endpoint: "/api/trpc",
        req,
        router: appRouter,
        createContext: ({ req }) => createTRPCContext({ req }),
        onError: ({ path, error }) => {
            console.error(
                `[tRPC] Error on ${path ?? "<no-path>"} (${error.code}):`,
                error.cause ?? error
            );
        },
    });

export { handler as GET, handler as POST };
