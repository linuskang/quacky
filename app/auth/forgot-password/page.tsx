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

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function Page() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)

    const requestReset = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        const res = await fetch("/api/auth/request-password-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                redirectTo: "/auth/reset-password",
            }),
        })

        setLoading(false)

        if (!res.ok) {
            const data = (await res.json().catch(() => null)) as {
                message?: string
            } | null
            setError(
                data?.message ??
                "Could not send a reset link. Please try again."
            )
            return
        }

        setSent(true)
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 sm:py-0">
            <div className="w-full max-w-xs">
                <div className="mb-6 text-center">
                    <Image
                        src="/goose/book.png"
                        alt="Quacky Logo"
                        width={120}
                        height={120}
                        priority
                        className="mx-auto mb-4 h-auto w-auto"
                    />
                    <h1 className="text-center text-3xl font-extrabold text-primary">
                        Reset your password
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <div className="space-y-4">
                        <div className="rounded-md border-2 border-border bg-card px-3 py-3 text-sm text-muted-foreground">
                            <Image
                                src="/goose/Hearts.png"
                                alt="A goose with hearts"
                                width={96}
                                height={96}
                                className="mx-auto mb-2 h-20 w-20 object-contain"
                            />
                            If an account exists for{" "}
                            <span className="font-medium text-foreground">
                                {email}
                            </span>
                            , a reset link has been sent.
                        </div>
                        <Button asChild className="h-11 w-full text-base">
                            <Link href="/auth/login">Back to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={requestReset} className="space-y-3">
                        <div>
                            <Label htmlFor="email" className="mb-1">
                                Your Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                placeholder="quacky@your.school"
                                className="h-8 border-2 border-border !bg-card transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="default"
                            className="h-11 w-full text-base"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            Remembered your password?{" "}
                            <Link
                                href="/auth/login"
                                className="text-primary-2 hover:underline"
                            >
                                Sign in
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}
