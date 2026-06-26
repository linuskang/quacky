"use client";

import { useState } from "react";
import { authClient } from "@/client/auth";
import Link from "next/link";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Github } from "@/components/icons"


export default function Page() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [resending, setResending] = useState(false);

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        await authClient.signIn.email(
            {
                email,
                password,
                callbackURL: "/"
            },
            {
                onRequest: () => {
                    setLoading(true);
                    setError("");
                },
                onSuccess: () => {
                    setLoading(false);
                },
                onError: (ctx) => {
                    setLoading(false);
                    const msg = ctx.error.message ?? "";
                    const code = (ctx.error as Record<string, unknown>).code as string | undefined;
                    if (code === "EMAIL_NOT_VERIFIED" || msg.toLowerCase().includes("not verified")) {
                        setError("EMAIL_NOT_VERIFIED");
                    } else {
                        setError(msg);
                    }
                }
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
                    setLoading(true);
                    setError("");
                }
            }
        )
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative px-4 py-8 sm:py-0">
            <div className="w-full max-w-xs">
                <div className="text-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="Quacky Logo"
                        width={150}
                        height={150}
                        priority
                        className="mx-auto mb-4 h-auto w-auto"
                    />
                    <h1 className="text-primary text-3xl font-extrabold text-center">
                        Sign in to Quacky
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Don&apos;t have an account? {" "}
                        <Link
                            href="/auth/register"
                            className="text-primary-2 hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>

                <div className="space-y-4 mb-4">
                    <Button
                        onClick={loginGithub}
                        className="w-full h-11 cursor-pointer text-sm flex items-center justify-center gap-2"
                    >
                        <Github />
                        Continue with GitHub
                    </Button>
                </div>

                <div className="flex items-center gap-2 mb-4">
                    <div className="flex-1 h-px bg-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-medium">or continue with</span>
                    <div className="flex-1 h-px bg-muted-foreground" />
                </div>

                <form onSubmit={login} className="space-y-3">
                    <div>
                        <Label
                            htmlFor="email"
                            className="mb-1"
                        >
                            Your Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            placeholder="quacky@your.school"
                            className="!bg-card border-2 border-border focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="password"
                            className="mb-1"
                        >
                            Your Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            placeholder="••••••••"
                            className="!bg-card border-2 border-border focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error === "EMAIL_NOT_VERIFIED" ? (
                        <div className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2.5 text-sm text-destructive space-y-2">
                            <p>Your email is not verified. We&aposve resent a verification email to your inbox.</p>
                        </div>
                    ) : error ? (
                        <div className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                            {error}
                        </div>
                    ) : null}

                    <Button
                        type="submit"
                        variant="default"
                        className="text-base w-full h-11"
                        disabled={loading}
                    >
                        {loading ? "Signing in..." : "Login"}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                        By signing in, you agree to abide by our {" "}
                        <Link href="/legal/terms"
                            className="text-primary-2 hover:underline">
                            Terms of Service
                        </Link>, and {" "}
                        <Link href="/legal/privacy"
                            className="text-primary-2 hover:underline">
                            Privacy Policy
                        </Link>.
                    </p>

                </form>
            </div>
        </div>
    )
}