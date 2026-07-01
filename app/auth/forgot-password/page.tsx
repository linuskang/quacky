"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sent, setSent] = useState(false);

    const requestReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const res = await fetch("/api/auth/request-password-reset", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                redirectTo: "/auth/reset-password",
            }),
        });

        setLoading(false);

        if (!res.ok) {
            const data = await res.json().catch(() => null) as { message?: string } | null;
            setError(data?.message ?? "Could not send a reset link. Please try again.");
            return;
        }

        setSent(true);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative px-4 py-8 sm:py-0">
            <div className="w-full max-w-xs">
                <div className="text-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="Quacky Logo"
                        width={120}
                        height={120}
                        priority
                        className="mx-auto mb-4 h-auto w-auto"
                    />
                    <h1 className="text-primary text-3xl font-extrabold text-center">
                        Reset your password
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Enter your email and we&apos;ll send you a reset link.
                    </p>
                </div>

                {sent ? (
                    <div className="space-y-4">
                        <div className="rounded-md border-2 border-border bg-card px-3 py-3 text-sm text-muted-foreground">
                            If an account exists for <span className="text-foreground font-medium">{email}</span>, a reset link has been sent.
                        </div>
                        <Button asChild className="text-base w-full h-11">
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
                                className="!bg-card transition border-2 border-border focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
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
                            className="text-base w-full h-11"
                            disabled={loading}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </Button>

                        <p className="text-xs text-muted-foreground text-center">
                            Remembered your password?{" "}
                            <Link href="/auth/login" className="text-primary-2 hover:underline">
                                Sign in
                            </Link>
                        </p>
                    </form>
                )}
            </div>
        </div>
    );
}
