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

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import axios from "axios"
import { toast } from "sonner"

import { PageLayout, PageCenter } from "@/components/page-layout"
import { Title, Description } from "@/components/text"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface User {
    id: string
    name: string | null | undefined
    username: string
    image?: string | null | undefined
}

interface LeaderboardEntry {
    number: number
    user: User
}

interface RngResponse {
    success: boolean
    number: number
    rank: number
}

interface LeaderboardResponse {
    success: boolean
    total: number
    entries: LeaderboardEntry[]
}

interface RngCardProps {
    initialEntry: {
        number: number | null
        rank: number | null
        hasRolled: boolean
    }
    initialLeaderboard: {
        total: number
        entries: LeaderboardEntry[]
    }
}

function getNextReset() {
    const now = new Date()
    return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)
    )
}

function formatTimeLeft(ms: number) {
    if (ms <= 0) return "0h 0m 0s"
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    return `${hours}h ${minutes}m ${seconds}s`
}

export function RngCard({ initialEntry, initialLeaderboard }: RngCardProps) {
    const router = useRouter()

    const [spinning, setSpinning] = useState(false)
    const [displayNumber, setDisplayNumber] = useState<number | null>(
        initialEntry.number
    )
    const [entry, setEntry] = useState(initialEntry)
    const [leaderboard, setLeaderboard] = useState(initialLeaderboard)
    const [timeLeft, setTimeLeft] = useState(() =>
        formatTimeLeft(getNextReset().getTime() - Date.now())
    )

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft(formatTimeLeft(getNextReset().getTime() - Date.now()))
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const fetchData = async () => {
        const [rngResult, leaderboardResult] = await Promise.allSettled([
            axios.get<RngResponse>("/api/rng"),
            axios.get<LeaderboardResponse>("/api/rng/today"),
        ])

        if (rngResult.status === "fulfilled") {
            const data = rngResult.value.data
            setEntry({
                number: data.number,
                rank: data.rank,
                hasRolled: true,
            })
            setDisplayNumber(data.number)
        } else if (axios.isAxiosError(rngResult.reason)) {
            if (rngResult.reason.response?.status !== 404) {
                toast.error("Failed to refresh your roll.")
            }
        }

        if (leaderboardResult.status === "fulfilled") {
            const data = leaderboardResult.value.data
            setLeaderboard({
                total: data.total,
                entries: data.entries,
            })
        } else {
            toast.error("Failed to refresh the leaderboard.")
        }
    }

    const handleSpin = async () => {
        if (spinning) return

        setSpinning(true)
        const MIN_SPIN_MS = 2000
        const startedAt = Date.now()
        setDisplayNumber(Math.floor(Math.random() * 1000000) + 1)

        intervalRef.current = setInterval(() => {
            setDisplayNumber(Math.floor(Math.random() * 1000000) + 1)
        }, 50)

        try {
            const res = await axios.post<RngResponse>("/api/rng")
            const data = res.data

            const elapsed = Date.now() - startedAt
            if (elapsed < MIN_SPIN_MS) {
                await new Promise((resolve) =>
                    setTimeout(resolve, MIN_SPIN_MS - elapsed)
                )
            }

            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }

            setEntry({
                number: data.number,
                rank: data.rank,
                hasRolled: true,
            })
            setDisplayNumber(data.number)
            toast.success(`You rolled ${data.number.toLocaleString()}!`)

            fetchData()
        } catch (error) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }

            if (axios.isAxiosError(error)) {
                toast.error(error.response?.data?.error || "Failed to roll.")
            } else {
                toast.error("Failed to roll.")
            }
        } finally {
            setSpinning(false)
        }
    }

    const handleShare = async () => {
        if (!entry.number) return

        const text = `I rolled ${entry.number.toLocaleString()} in Quacky's random number game today! 🎲`

        try {
            await navigator.clipboard.writeText(text)
            toast.success("Copied to clipboard!")
        } catch {
            toast.error("Failed to copy.")
        }
    }

    return (
        <PageLayout>
            <PageCenter>
                <Title>random number gaem</Title>
                <Description>
                    GAMBLING GAMBLING GAMBLING GAMBLING GAMBLING YAY
                </Description>

                <p className="text-sm font-semibold text-muted-foreground">
                    Ok but seriously, the person who has the highest rolled
                    number wins{" "}
                    <span className="font-bold text-primary">nothing!</span>{" "}
                    because clout is the best reward
                </p>

                <p className="mt-2 text-sm font-semibold text-muted-foreground">
                    resets in{" "}
                    <span className="font-bold text-primary">{timeLeft}</span>
                </p>

                <Card className="mt-4 bg-card-primary p-4">
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-sm font-bold text-muted-foreground">
                            {entry.hasRolled
                                ? "YOUR NUMBER TODAY"
                                : "YOU HAVENT ROLLED TODAY"}
                        </h1>
                        <h1
                            className={cn(
                                "text-5xl font-bold text-primary tabular-nums",
                                spinning
                            )}
                        >
                            {displayNumber !== null
                                ? displayNumber.toLocaleString()
                                : "???"}
                        </h1>
                        {entry.hasRolled && entry.rank !== null && (
                            <>
                                <p className="text-sm font-semibold text-primary-2">
                                    not too shabby
                                </p>

                                <p className="text-xs font-semibold text-muted-foreground">
                                    #{entry.rank} today
                                </p>
                            </>
                        )}

                        <div className="flex gap-2">
                            {entry.hasRolled ? (
                                <>
                                    <Button
                                        variant="secondary"
                                        className="mt-4 h-10 rounded-full px-4 text-lg font-semibold"
                                        onClick={() =>
                                            router.push("/rng/history")
                                        }
                                    >
                                        see history
                                    </Button>

                                    <Button
                                        variant="default"
                                        className="mt-4 h-10 rounded-full bg-primary-2 px-4 text-lg font-semibold"
                                        onClick={handleShare}
                                    >
                                        share number
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="default"
                                    className="mt-4 h-10 rounded-full bg-primary-2 px-8 text-lg font-semibold"
                                    disabled={spinning}
                                    onClick={handleSpin}
                                >
                                    {spinning ? "spinning..." : "spin"}
                                </Button>
                            )}
                        </div>
                    </div>
                </Card>

                <div className="mt-4 flex flex-col items-center justify-center gap-4">
                    <h1 className="text-2xl font-bold text-primary">Today</h1>
                    <p className="-mt-3 text-sm font-semibold text-muted-foreground">
                        {leaderboard.total} rolls
                    </p>
                </div>

                {leaderboard.entries.length !== 0 && (
                    <>
                        <div className="flex justify-center">
                            <Card className="mt-4 flex h-50 w-full max-w-[15rem] flex-col items-center justify-center gap-2 bg-card-primary p-4">
                                <h1 className="text-lg font-bold text-primary-2">
                                    #1
                                </h1>
                                {leaderboard.entries[0] ? (
                                    <>
                                        <Image
                                            src={
                                                leaderboard.entries[0].user
                                                    .image ??
                                                "/default-avatar.png"
                                            }
                                            alt={
                                                leaderboard.entries[0].user
                                                    .name ?? "User"
                                            }
                                            width={60}
                                            height={60}
                                            className="h-[60px] w-[60px] rounded-full object-cover"
                                        />
                                        <Link
                                            href={`/@${leaderboard.entries[0].user.username}`}
                                            className="hover:underline"
                                        >
                                            <p className="text-lg font-bold text-primary hover:text-primary-2">
                                                {
                                                    leaderboard.entries[0].user
                                                        .name
                                                }
                                            </p>
                                        </Link>
                                        <p className="text-2xl font-semibold text-primary-2">
                                            {leaderboard.entries[0].number.toLocaleString()}
                                        </p>
                                    </>
                                ) : null}
                            </Card>
                        </div>

                        <div className="mt-4 flex justify-center gap-4">
                            {leaderboard.entries[1] && (
                                <Card className="mr-auto flex h-40 w-full max-w-[11rem] flex-col items-center justify-center gap-2 bg-card-primary p-4">
                                    <h1 className="text-base font-bold text-primary-2">
                                        #2
                                    </h1>
                                    <>
                                        <Image
                                            src={
                                                leaderboard.entries[1].user
                                                    .image ??
                                                "/default-avatar.png"
                                            }
                                            alt={
                                                leaderboard.entries[1].user
                                                    .name ?? "User"
                                            }
                                            width={50}
                                            height={50}
                                            className="rounded-full object-cover"
                                        />
                                        <Link
                                            href={`/@${leaderboard.entries[1].user.username}`}
                                            className="hover:underline"
                                        >
                                            <p className="font-bold text-primary hover:text-primary-2">
                                                {
                                                    leaderboard.entries[1].user
                                                        .name
                                                }
                                            </p>
                                        </Link>
                                        <p className="text-xl font-semibold text-primary-2">
                                            {leaderboard.entries[1].number.toLocaleString()}
                                        </p>
                                    </>
                                </Card>
                            )}

                            {leaderboard.entries[2] && (
                                <Card className="ml-auto flex h-40 w-full max-w-[11rem] flex-col items-center justify-center gap-2 bg-card-primary p-4">
                                    <h1 className="text-base font-bold text-primary-2">
                                        #3
                                    </h1>

                                    <>
                                        <Image
                                            src={
                                                leaderboard.entries[2].user
                                                    .image ??
                                                "/default-avatar.png"
                                            }
                                            alt={
                                                leaderboard.entries[2].user
                                                    .name ?? "User"
                                            }
                                            width={50}
                                            height={50}
                                            className="rounded-full object-cover"
                                        />
                                        <Link
                                            href={`/@${leaderboard.entries[2].user.username}`}
                                            className="hover:underline"
                                        >
                                            <p className="font-bold text-primary hover:text-primary-2">
                                                {
                                                    leaderboard.entries[2].user
                                                        .name
                                                }
                                            </p>
                                        </Link>
                                        <p className="text-xl font-semibold text-primary-2">
                                            {leaderboard.entries[2].number.toLocaleString()}
                                        </p>
                                    </>
                                </Card>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {leaderboard.entries
                                .slice(3)
                                .map((entry, index) => (
                                    <Card
                                        key={entry.user.id}
                                        className="bg-card-primary p-3"
                                    >
                                        <div className="flex items-center">
                                            <div className="mr-auto flex items-center">
                                                <h1 className="mr-5 text-sm font-bold text-muted-foreground">
                                                    #{index + 4}
                                                </h1>
                                                <Image
                                                    src={
                                                        entry.user.image ??
                                                        "/default-avatar.png"
                                                    }
                                                    alt={
                                                        entry.user.name ??
                                                        "User"
                                                    }
                                                    width={30}
                                                    height={30}
                                                    className="mr-3 rounded-full"
                                                />
                                                <Link
                                                    href={`/@${entry.user.username}`}
                                                    className="hover:underline"
                                                >
                                                    <p className="text-lg font-bold text-primary">
                                                        {entry.user.name}
                                                    </p>
                                                </Link>
                                            </div>
                                            <div className="ml-auto flex items-center">
                                                <p className="mr-3 text-lg font-semibold text-primary-2">
                                                    {entry.number.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    </>
                )}
            </PageCenter>
        </PageLayout>
    )
}
