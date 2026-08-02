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
import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get("token") ?? ""
    const invalidToken = searchParams.get("error") === "INVALID_TOKEN"
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(
        invalidToken ? "This reset link is invalid or expired." : ""
    )
    const [success, setSuccess] = useState(false)

    const resetPassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!token) {
            setError(
                "This reset link is missing a token. Please request a new reset link."
            )
            return
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)

        const res = await fetch("/api/auth/reset-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                token,
                newPassword: password,
            }),
        })

        setLoading(false)

        if (!res.ok) {
            const data = (await res.json().catch(() => null)) as {
                message?: string
            } | null
            setError(
                data?.message ??
                    "Could not reset your password. Please request a new reset link."
            )
            return
        }

        setSuccess(true)
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 sm:py-0">
            <div className="w-full max-w-xs">
                <div className="mb-6 text-center">
                    <Image
                        src="/goose/First Aid Nurse.png"
                        alt="Quacky Logo"
                        width={120}
                        height={120}
                        priority
                        className="mx-auto mb-4 h-auto w-auto"
                    />
                    <h1 className="text-center text-3xl font-extrabold text-primary">
                        Choose a new password
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter a new password for your account.
                    </p>
                </div>

                {success ? (
                    <div className="space-y-4">
                        <div className="rounded-md border-2 border-border bg-card px-3 py-3 text-sm text-muted-foreground">
                            <Image
                                src="/goose/Celebration.png"
                                alt="A celebrating goose"
                                width={96}
                                height={96}
                                className="mx-auto mb-2 h-20 w-20 object-contain"
                            />
                            Your password has been reset. You can now sign in
                            with your new password.
                        </div>
                        <Button asChild className="h-11 w-full text-base">
                            <Link href="/auth/login">Go to Login</Link>
                        </Button>
                    </div>
                ) : (
                    <form onSubmit={resetPassword} className="space-y-3">
                        <div>
                            <Label htmlFor="password" className="mb-1">
                                New Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                className="h-8 border-2 border-border !bg-card transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="confirm-password" className="mb-1">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirm-password"
                                type="password"
                                value={confirmPassword}
                                className="h-8 border-2 border-border !bg-card transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]"
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
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
                            disabled={loading || !token}
                        >
                            {loading ? "Resetting..." : "Reset Password"}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground">
                            Need a new link?{" "}
                            <Link
                                href="/auth/forgot-password"
                                className="text-primary-2 hover:underline"
                            >
                                Request one
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense>
            <ResetPasswordForm />
        </Suspense>
    )
}
