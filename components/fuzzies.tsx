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
import { BadgeCheck, Flag, SendHorizontal } from "lucide-react"
import { toast } from "sonner"
import { Admin } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { SearchBar } from "@/components/search-bar"
import { Textarea } from "@/components/ui/textarea"
import { CharCounter } from "@/components/character-counter"
import type { User } from "@/types"

type Fuzzy = {
    id: string
    message: string
    flagged: boolean
    createdAt: string
}

type SearchUser = Required<Pick<User, "id">> &
    Omit<User, "id" | "role"> & {
        role: string | null
    }

export function Fuzzies() {
    const [fuzzies, setFuzzies] = useState<Fuzzy[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState("")
    const [users, setUsers] = useState<SearchUser[]>([])
    const [recipient, setRecipient] = useState<SearchUser | null>(null)
    const [message, setMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [locked, setLocked] = useState(false)
    const [reportingId, setReportingId] = useState<string | null>(null)
    const [reportReason, setReportReason] = useState("")

    useEffect(() => {
        void fetch("/api/fuzzy")
            .then(async (res) => {
                if (!res.ok) throw new Error(res.statusText)
                return (await res.json()) as Fuzzy[]
            })
            .then(setFuzzies)
            .catch(() => toast.error("Could not load warm fuzzies."))
            .finally(() => setLoading(false))
    }, [])

    useEffect(() => {
        const trimmedQuery = query.trim()

        if (!trimmedQuery || recipient) return

        const controller = new AbortController()

        void fetch(
            `/api/users/mentions?q=${encodeURIComponent(trimmedQuery)}`,
            {
                signal: controller.signal,
            }
        )
            .then(async (res) => {
                if (!res.ok) return []
                const data = (await res.json()) as { users?: SearchUser[] }
                return data.users ?? []
            })
            .then(setUsers)
            .catch((error) => {
                if (
                    error instanceof DOMException &&
                    error.name === "AbortError"
                ) {
                    return
                }

                setUsers([])
            })

        return () => controller.abort()
    }, [query, recipient])

    async function sendFuzzy() {
        if (!recipient || !message.trim() || sending) return

        setSending(true)

        const res = await fetch("/api/fuzzy", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                receiverId: recipient.id,
                message: message.trim(),
            }),
        })

        setSending(false)

        if (!res.ok) {
            if (res.status === 403) setLocked(true)
            toast.error(await res.text())
            return
        }

        setRecipient(null)
        setQuery("")
        setUsers([])
        setMessage("")
        toast.success("Warm fuzzy sent!")
    }

    async function reportFuzzy(id: string) {
        const reason = reportReason.trim()

        if (!reason) return

        const res = await fetch("/api/fuzzy/report", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, reason }),
        })

        if (!res.ok) {
            toast.error(await res.text())
            return
        }

        setReportingId(null)
        setReportReason("")
        toast.success("Warm fuzzy reported.")
    }

    const visibleUsers = query.trim() && !recipient ? users : []

    return (
        <div className="space-y-5">
            <Card className="space-y-3 !bg-card-primary p-4">
                <div>
                    <h2 className="text-base font-bold text-primary">
                        Send a warm fuzzy
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Pick someone and send them a kind anonymous message.
                    </p>
                </div>

                {locked && (
                    <p className="rounded-md bg-primary/10 p-3 text-sm font-medium text-primary">
                        Warm fuzzies are locked.{" "}
                        <Link href="/quiz/fuzzies" className="underline">
                            Complete the quiz
                        </Link>{" "}
                        to unlock them.
                    </p>
                )}

                <div className="relative">
                    <SearchBar
                        value={query}
                        onChange={(event) => {
                            setQuery(event.target.value)
                            setRecipient(null)
                        }}
                        placeholder="Search for someone..."
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
                                        setUsers([])
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
                                                <BadgeCheck className="h-4 w-4 fill-primary text-background" />
                                            )}
                                            {user.role === "admin" && <Admin />}
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
                />

                <div className="flex items-center justify-end gap-2">
                    <CharCounter length={message.length} maxLength={400} />
                    <Button
                        onClick={sendFuzzy}
                        disabled={
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
