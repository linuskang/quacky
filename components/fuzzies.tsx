//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Flag, SendHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Admin, BotBadge, VerifiedBadge } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"
import { Textarea } from "@/components/ui/textarea"
import { CharCounter } from "@/components/character-counter"
import type { User } from "@/types"
import { authClient } from "@/client/auth"
import { trpc } from "@/lib/trpc"
import { TRPCClientError } from "@trpc/client"

type SearchUser = Required<Pick<User, "id">> &
    Omit<User, "id" | "role"> & {
        role: string | null
    }

export function Fuzzies() {
    const [query, setQuery] = useState("")
    const [recipient, setRecipient] = useState<SearchUser | null>(null)
    const [message, setMessage] = useState("")
    const [locked, setLocked] = useState(false)
    const [reportingId, setReportingId] = useState<string | null>(null)
    const [reportReason, setReportReason] = useState("")
    const { data: session } = authClient.useSession()
    const utils = trpc.useUtils()

    const {
        data: fuzzies = [],
        isLoading: loading,
        isError: fuzziesError,
    } = trpc.fuzzies.list.useQuery()

    const trimmedQuery = query.trim()
    const { data: mentionsData } = trpc.users.mentions.useQuery(
        { query: trimmedQuery },
        { enabled: Boolean(trimmedQuery) && !recipient }
    )

    const sendFuzzyMutation = trpc.fuzzies.send.useMutation()
    const reportFuzzyMutation = trpc.fuzzies.report.useMutation()

    const sending = sendFuzzyMutation.isPending
    const fuzziesLocked =
        locked || session?.user.unlockedFuzzies === false

    useEffect(() => {
        if (fuzziesError) {
            toast.error("Could not load warm fuzzies.")
        }
    }, [fuzziesError])

    useEffect(() => {
        if (!loading && !fuzziesError) {
            void utils.me.get.invalidate()
        }
    }, [loading, fuzziesError, utils])

    async function sendFuzzy() {
        if (!recipient || !message.trim() || sending) return

        try {
            await sendFuzzyMutation.mutateAsync({
                receiverId: recipient.id,
                message: message.trim(),
            })
            setRecipient(null)
            setQuery("")
            setMessage("")
            toast.success("Warm fuzzy sent!")
            await Promise.all([
                utils.fuzzies.list.invalidate(),
                utils.me.get.invalidate(),
            ])
        } catch (error) {
            if (
                error instanceof TRPCClientError &&
                error.data?.code === "FORBIDDEN"
            ) {
                setLocked(true)
            }
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not send warm fuzzy."
            )
        }
    }

    async function reportFuzzy(id: string) {
        const reason = reportReason.trim()

        if (!reason) return

        try {
            await reportFuzzyMutation.mutateAsync({ id, reason })
            setReportingId(null)
            setReportReason("")
            toast.success("Warm fuzzy reported.")
            await utils.fuzzies.list.invalidate()
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not report warm fuzzy."
            )
        }
    }

    const visibleUsers: SearchUser[] =
        trimmedQuery && !recipient ? (mentionsData?.users ?? []) : []

    return (
        <div className="space-y-5">
            <Card className="relative space-y-3 !bg-card-primary p-4">
                <div>
                    <h2 className="text-base font-bold text-primary">
                        Send a warm fuzzy
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Pick someone and send them a kind anonymous message.
                    </p>
                </div>

                {fuzziesLocked && (
                    <p className="rounded-md bg-primary/10 p-3 text-sm font-medium text-primary">
                        Warm fuzzies are locked.{" "}
                        <Link href="/quiz/fuzzies" className="underline">
                            Complete the quiz
                        </Link>{" "}
                        to unlock them.
                    </p>
                )}

                <div
                    className={
                        fuzziesLocked
                            ? "pointer-events-none select-none blur-sm"
                            : undefined
                    }
                >
                    <div className="relative">
                    <SearchBar
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setRecipient(null)
                        }}
                        placeholder="Search for someone..."
                        disabled={fuzziesLocked}
                    />

                    {visibleUsers.length > 0 && (
                        <div className="absolute top-full left-0 z-50 mt-2 w-full overflow-hidden rounded-md border-2 border-border bg-background shadow-sm">
                            {visibleUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    onMouseDown={() => {
                                        setRecipient(user)
                                        setQuery(`@${user.username}`)
                                    }}
                                    className="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-primary/10"
                                >
                                    <Image
                                        src={user.image}
                                        alt={user.name}
                                        width={32}
                                        height={32}
                                        unoptimized
                                        className="h-8 w-8 rounded-full object-cover"
                                    />
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1">
                                            <span className="truncate text-sm font-semibold text-primary">
                                                {user.name}
                                            </span>
                                            {user.verified && (
                                                <VerifiedBadge />
                                            )}
                                            {user.role?.toLowerCase() === "admin" && <Admin />}
                                            {user.role?.toLowerCase() === "bot" && <BotBadge />}
                                        </div>
                                        <p className="truncate text-xs text-muted-foreground">
                                            @{user.username}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                    </div>

                    <Textarea
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Write something kind..."
                        className="min-h-24 resize-none border-2 border-border !bg-card"
                        disabled={fuzziesLocked}
                    />

                    <div className="flex items-center justify-end gap-2">
                        <CharCounter length={message.length} maxLength={400} />
                        <Button
                            onClick={sendFuzzy}
                            disabled={
                                fuzziesLocked ||
                                !recipient ||
                                !message.trim() ||
                                message.length > 400 ||
                                sending
                            }
                            className="rounded-full bg-primary-2 hover:bg-primary-2/80"
                        >
                            <SendHorizontal className="h-4 w-4" />
                            {sending ? "Sending..." : "Send"}
                        </Button>
                    </div>
                </div>

                {fuzziesLocked && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-card-primary/60 p-4 text-center backdrop-blur-[1px]">
                        <p className="text-sm font-semibold text-primary">
                            Warm fuzzies are locked.{" "}
                            <Link href="/quiz/fuzzies" className="underline">
                                Complete the Warm Fuzzies Quiz
                            </Link>{" "}
                            to unlock them.
                        </p>
                    </div>
                )}
            </Card>

            <div className="space-y-3">
                <h2 className="text-base font-bold text-primary">
                    Your warm fuzzies
                </h2>

                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                ) : fuzzies.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        No warm fuzzies yet.
                    </p>
                ) : (
                    fuzzies.map((fuzzy) => (
                        <Card
                            key={fuzzy.id}
                            className="space-y-3 !bg-card-primary p-4"
                        >
                            <p className="text-sm leading-6">{fuzzy.message}</p>
                            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                                <span>
                                    {new Date(
                                        fuzzy.createdAt
                                    ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReportingId(fuzzy.id)}
                                    className="h-7 text-muted-foreground hover:text-primary"
                                >
                                    <Flag className="h-4 w-4" />
                                    Report
                                </Button>
                            </div>

                            {reportingId === fuzzy.id && (
                                <div className="space-y-2">
                                    <Textarea
                                        value={reportReason}
                                        onChange={(event) =>
                                            setReportReason(event.target.value)
                                        }
                                        placeholder="Why are you reporting this?"
                                        className="min-h-20 resize-none border-2 border-border !bg-card"
                                    />
                                    <div className="flex justify-end gap-2">
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => {
                                                setReportingId(null)
                                                setReportReason("")
                                            }}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            size="sm"
                                            onClick={() =>
                                                void reportFuzzy(fuzzy.id)
                                            }
                                            disabled={!reportReason.trim()}
                                        >
                                            Submit report
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
