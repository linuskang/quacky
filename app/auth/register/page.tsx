"use client";

import { useState } from "react";
import { authClient } from "@/client/auth";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";


export default function Page() {
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const createAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!agreed) {
            setError("You must agree to the Terms of Service to continue.");
            return;
        }

        setLoading(true);

        const { data, error } = await authClient.signUp.email(
            {
                name,
                username,
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
                    toast.success("Account created successfully! Please check your email to verify your account.");
                },
                onError: (ctx) => {
                    setLoading(false);
                    setError(ctx.error.message);
                }
            }
        );
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
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-primary text-3xl font-extrabold text-center">
                        Create an Account
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Existing user? {" "}
                        <Link
                            href="/auth/login"
                            className="text-primary-2 hover:underline"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>


                <form onSubmit={createAccount} className="space-y-3">
                    <div>
                        <Label
                            htmlFor="name"
                            className="mb-1"
                        >
                            Your Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            className="bg-card border border-border/40 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <Label
                            htmlFor="name"
                            className="mb-1"
                        >
                            Your Username
                        </Label>
                        <Input
                            id="username"
                            type="text"
                            value={username}
                            className="bg-card border border-border/40 focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
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
                    <div className="flex items-start gap-2 pt-1">
                        <Checkbox
                            id="terms"
                            checked={agreed}
                            onCheckedChange={(checked) => setAgreed(checked === true)}
                        />
                        <Label htmlFor="terms" className="text-sm text-muted-foreground leading-none mt-0.5 cursor-pointer">
                            I agree to the{" "}
                            <Link
                                href="/legal/terms"
                                target="_blank"
                                className="text-primary-2 hover:underline"
                            >
                                Terms of Service
                            </Link>
                        </Label>
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
                        disabled={loading || !agreed}
                    >
                        {loading ? "Creating account..." : "Create Account"}
                    </Button>

                </form>
            </div>
        </div>
    )
}
