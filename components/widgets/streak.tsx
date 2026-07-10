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
import { cn } from "@/lib/utils"

import { Widget, WidgetContent, WidgetPrimaryHeader } from "./widget"

const WEEK_DAYS = [
    { label: "M", key: "mon" },
    { label: "T", key: "tue" },
    { label: "W", key: "wed" },
    { label: "T", key: "thu" },
    { label: "F", key: "fri" },
    { label: "S", key: "sat" },
    { label: "S", key: "sun" },
]

type StreakWeek = Record<(typeof WEEK_DAYS)[number]["key"], boolean>

interface MeResponse {
    streak?: {
        current: number
        week: StreakWeek
    }
}

const EMPTY_WEEK: StreakWeek = {
    mon: false,
    tue: false,
    wed: false,
    thu: false,
    fri: false,
    sat: false,
    sun: false,
}

function getTimeUntilTomorrow() {
    const now = new Date()
    const tomorrow = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1
    )
    const remaining = Math.max(0, tomorrow.getTime() - now.getTime())
    const hours = Math.floor(remaining / (60 * 60 * 1000))
    const minutes = Math.floor((remaining / (60 * 1000)) % 60)
    const seconds = Math.floor((remaining / 1000) % 60)

    return [hours, minutes, seconds]
        .map((value) => value.toString().padStart(2, "0"))
        .join(":")
}

export function StreakWidget() {
    const [streak, setStreak] = useState({
        current: 0,
        week: EMPTY_WEEK,
    })
    const [timeUntilTomorrow, setTimeUntilTomorrow] = useState("--:--:--")
    const [todayIndex, setTodayIndex] = useState<number | null>(null)

    useEffect(() => {
        let cancelled = false
        const loadStreak = () => {
            fetch("/api/me", { cache: "no-store" })
                .then((res) => (res.ok ? res.json() : null))
                .then((data: MeResponse | null) => {
                    if (!cancelled && data?.streak) {
                        setStreak(data.streak)
                    }
                })
                .catch(() => undefined)
        }

        loadStreak()
        window.addEventListener("quacky:check-in", loadStreak)

        return () => {
            cancelled = true
            window.removeEventListener("quacky:check-in", loadStreak)
        }
    }, [])

    useEffect(() => {
        const updateClock = () => {
            setTimeUntilTomorrow(getTimeUntilTomorrow())
            setTodayIndex((new Date().getDay() + 6) % 7)
        }

        const timeout = setTimeout(updateClock, 0)
        const interval = setInterval(updateClock, 1000)

        return () => {
            clearTimeout(timeout)
            clearInterval(interval)
        }
    }, [])

    return (
        <Widget>
            <WidgetPrimaryHeader>
                <div className="flex items-center gap-3">
                    <Image
                        src="/comet.svg"
                        alt="Streak"
                        width={50}
                        height={50}
                        className="shrink-0"
                    />
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold text-primary">
                            {streak.current} DAY STREAK
                        </h1>
                        <p className="text-xs">
                            New day in{" "}
                            <span className="font-semibold text-accent">
                                {timeUntilTomorrow}
                            </span>
                        </p>
                    </div>
                </div>
            </WidgetPrimaryHeader>

            <WidgetContent>
                <div className="flex items-center justify-between px-1">
                    {WEEK_DAYS.map((day, i) => {
                        const isToday = i === todayIndex
                        const isFilled = streak.week[day.key]
                        return (
                            <div
                                key={day.key}
                                className="flex flex-col items-center gap-1"
                            >
                                <Image
                                    src={
                                        isFilled
                                            ? "/star.svg"
                                            : "/star-empty.svg"
                                    }
                                    alt={
                                        isFilled ? "Completed" : "Not completed"
                                    }
                                    width={32}
                                    height={32}
                                    className="shrink-0"
                                />
                                <span
                                    className={cn(
                                        "text-xs font-bold",
                                        isToday
                                            ? "text-primary dark:text-primary-2"
                                            : "text-muted-foreground"
                                    )}
                                >
                                    {day.label}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </WidgetContent>
        </Widget>
    )
}
