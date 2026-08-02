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

import { useState, useEffect } from "react"
import { authClient } from "@/client/auth"
import Link from "next/link"
import Image from "next/image"
import axios from "axios"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Github } from "@/components/icons"

export default function Page() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [bannermsg, setBannerMsg] = useState("")

    useEffect(() => {
        const fetchMsg = async () => {
            try {
                await axios.get("/api/meta").then((res) => {
                    setBannerMsg(res.data.org.loginBannerMsg)
                })
            } catch {
                toast.error("somethign blew up. please try again later.")
            }
        }
        fetchMsg()
    }, [])

    const login = async (e: React.FormEvent) => {
        e.preventDefault()
        await authClient.signIn.email(
            {
                email,
                password,
                callbackURL: "/",
            },
            {
                onRequest: () => {
                    setLoading(true)
                    setError("")
                },
                onSuccess: () => {
                    setLoading(false)
                },
                onError: (ctx) => {
                    setLoading(false)
                    const msg = ctx.error.message ?? ""
                    const code = (ctx.error as Record<string, unknown>).code as
                        string | undefined
                    if (
                        code === "EMAIL_NOT_VERIFIED" ||
                        msg.toLowerCase().includes("not verified")
                    ) {
                        setError("EMAIL_NOT_VERIFIED")
                    } else {
                        setError(msg)
                    }
                },
            }
        )
    }

    const loginGithub = async () => {
        await authClient.signIn.social(
            {
                provider: "github",
            },
            {
                onRequest: () => {
                    setLoading(true)
                    setError("")
                },
            }
        )
    }

    const loginGoogle = async () => {
        await authClient.signIn.social(
            {
                provider: "google",
            },
            {
                onRequest: () => {
                    setLoading(true)
                    setError("")
                },
            }
        )
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 sm:py-0">
            <div className="w-full max-w-xs">
                <div className="mb-6 text-center">
                    <Image
                        src="/goose/Hello Spanish Hola.png"
                        alt="Quacky Logo"
                        width={120}
                        height={120}
                        priority
                        className="mx-auto mb-4 h-auto w-auto"
                    />
                    <h1 className="text-center text-3xl font-extrabold text-primary">
                        Sign in to Quacky
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/auth/register"
                            className="text-primary-2 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                {bannermsg && (
                    <div className="mb-4 space-y-2 rounded-md border-2 border-primary-2 bg-primary-2/10 px-3 py-2.5 text-sm text-primary-2">
                        <p className="whitespace-pre-line">{bannermsg}</p>
                    </div>
                )}

                <div className="mb-4 space-y-2">
                    <Button
                        onClick={loginGithub}
                        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 text-sm"
                    >
                        <Github />
                        Continue with GitHub
                    </Button>
                    <Button
                        onClick={loginGoogle}
                        className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 text-sm"
                    >
                        <svg
                            role="img"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <title>Google</title>
                            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                        </svg>
                        Continue with Google
                    </Button>
                </div>

                <div className="mb-4 flex items-center gap-2">
                    <div className="h-px flex-1 bg-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">
                        or continue with
                    </span>
                    <div className="h-px flex-1 bg-muted-foreground" />
                </div>

                <form onSubmit={login} className="space-y-3">
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
                    <div>
                        <Label htmlFor="password" className="mb-1">
                            Your Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            placeholder="••••••••"
                            className="h-8 border-2 border-border !bg-card transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <div className="mt-1 text-right">
                            <Link
                                href="/auth/forgot-password"
                                className="text-xs text-primary-2 hover:underline"
                            >
                                Forgot your password?
                            </Link>
                        </div>
                    </div>

                    {error === "EMAIL_NOT_VERIFIED" ? (
                        <div className="space-y-2 rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                            <p>
                                Your email is not verified. We resent a
                                verification email to your inbox.
                            </p>
                        </div>
                    ) : error ? (
                        <div className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                            {error}
                        </div>
                    ) : null}

                    <Button
                        type="submit"
                        variant="default"
                        className="h-11 w-full text-base"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </Button>

                    <p className="text-center text-xs text-muted-foreground">
                        By signing in, you agree to abide by our{" "}
                        <Link
                            href="/legal/terms"
                            className="text-primary-2 hover:underline"
                        >
                            Terms of Service
                        </Link>
                        , and{" "}
                        <Link
                            href="/legal/privacy"
                            className="text-primary-2 hover:underline"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </form>
            </div>
        </div>
    )
}
