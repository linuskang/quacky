"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import {
    TRPCClientError,
    httpBatchLink,
    httpLink,
    isNonJsonSerializable,
    splitLink,
} from "@trpc/client"
import { useState } from "react"

import { trpc } from "@/lib/trpc"

function shouldRetry(failureCount: number, error: unknown) {
    if (error instanceof TRPCClientError) {
        const httpStatus = error.data?.httpStatus
        if (typeof httpStatus === "number" && httpStatus >= 400 && httpStatus < 500) {
            return false
        }
    }

    return failureCount < 2
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 10_000,
                        retry: shouldRetry,
                    },
                    mutations: {
                        retry: false,
                    },
                },
            })
    )
    const [trpcClient] = useState(() =>
        trpc.createClient({
            links: [
                splitLink({
                    condition: (op) => isNonJsonSerializable(op.input),
                    true: httpLink({
                        url: "/api/trpc",
                    }),
                    false: httpBatchLink({
                        url: "/api/trpc",
                    }),
                }),
            ],
        })
    )

    return (
        <trpc.Provider client={trpcClient} queryClient={queryClient}>
            <QueryClientProvider client={queryClient}>
                {children}
            </QueryClientProvider>
        </trpc.Provider>
    )
}
