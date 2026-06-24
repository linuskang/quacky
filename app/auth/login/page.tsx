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

    const login = async (e: React.FormEvent) => {
        e.preventDefault();
        const { data, error } = await authClient.signIn.email(
            {
                email,
                password,
                callbackURL: "/"
            },
            {
                onRequest: (ctx) => {
                    setLoading(true);
                    setError("");
                },
                onSuccess: (ctx) => {
                    setLoading(false);
                },
                onError: (ctx) => {
                    setLoading(false);
                    setError(ctx.error.message);
                }
            }
        )
    }

    const loginGithub = async () => {
        const { data, error } = await authClient.signIn.social(
            {
                provider: "github",
            },
            {
                onRequest: (ctx) => {
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
                        Don't have an account? {" "}
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
                            className="bg-card border border-border/40 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
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
                            className="bg-card border border-border/40 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    {error && (
                        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                            {error}
                        </div>
                    )}

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