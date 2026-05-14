// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { useEffect, useState } from "react";
import { authClient } from "@/client/auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { OnboardingStepper } from "@/components/quacky/onboarding-stepper";

// Types
type Rule = {
    title: string;
    description: string;
};
type Step = 1 | 2 | 3;

export default function OnboardingPage() {
    const [step, setStep] = useState<Step>(1);
    const [selfRegister, setSelfRegister] = useState<boolean | null>(null);

    const [orgName, setOrgName] = useState("");
    const [rules, setRules] = useState<Rule[] | null>(null);

    const [displayName, setDisplayName] = useState("");
    const [handle, setHandle] = useState("");
    const [email, setEmail] = useState("");
    const [formError, setFormError] = useState<string | null>(null);
    const [sendingCode, setSendingCode] = useState(false);


    // Metadata
    useEffect(() => {
        fetch("/api/v1/meta")
            .then((r) => r.json())
            .then((data) => {
                setOrgName(data.org_name)
                setSelfRegister(data.canRegister.enabled)
                setRules(data.rules)
            })
    }, []);

    const createAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        fetch("/api/v1/create", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: displayName.trim(),
                handle: handle.trim(),
                email: email.trim(),
            }),
        })
            .then((r) => r.json())
            .then(async (data) => {
                if (data.error) {
                    setFormError(data.error);
                } else {
                    await authClient.signIn.magicLink({
                        email: email.trim(),
                        callbackURL: "/",
                    });
                    setStep(3);
                    setFormError(null);
                }
            })
            .catch(() => {
                setFormError("An unexpected error occurred. Please try again.");
            });
    };

    // Loading
    if (selfRegister == null) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background">
                <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
        );
    }

    // Self registration disabled
    if (selfRegister == false) {
        return (
            <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm text-center space-y-4">
                    <img
                        src="/assets/logo/sleepy.png"
                        alt="Quacky"
                        className="w-40 h-40 object-contain mx-auto"
                    />
                    <div className="rounded-xl border border-muted bg-card px-5 py-5 space-y-2">
                        <p className="font-semibold text-foreground">Uh oh!</p>
                        <p className="text-sm text-muted-foreground">
                            Registrations have been disabled by an admin. Please contact your school administrator for an invitation to join Quacky.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-12">
            <div className="w-full max-w-sm">

                <div className="mb-0 flex justify-center">
                    <img
                        src="/assets/logo/flying.png"
                        alt="Quacky"
                        className="h-40 w-40 object-contain"
                    />
                </div>
                <h1 className="text-3xl font-bold text-primary text-center mb-2">Join {orgName}</h1>

                <OnboardingStepper step={step} />

                {step === 1 && (
                    <div className="space-y-3">
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-primary">
                                Some ground rules.
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                These are set and enforced by moderators.
                            </p>
                        </div>

                        <div className="space-y-0 rounded-xl border border-border overflow-hidden bg-card">
                            {rules?.map((rule, i) => (
                                <div key={rule.title}>
                                    <div className="flex gap-3 px-4 py-3.5">
                                        <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground leading-snug">
                                                {rule.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                                                {rule.description}
                                            </p>
                                        </div>
                                    </div>
                                    {i < rules.length - 1 && <Separator />}
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <Button className="cursor-pointer w-full h-11" onClick={() => setStep(2)}>
                                Accept
                            </Button>
                            <Button
                                variant="outline"
                                className="cursor-pointer w-full h-11"
                                onClick={() => (window.location.href = "/login")}
                            >
                                Back
                            </Button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={createAccount} className="space-y-5">
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-primary">
                                Let's get you set up.
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Create your Quacky account.
                            </p>
                        </div>

                        {formError && (
                            <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                                {formError}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="displayName">Display name</Label>
                                <Input
                                    id="displayName"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    placeholder="Your name"
                                    required
                                    className="h-11 bg-card"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Your publicly visible name. You can change this later.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="handle">Username</Label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                                        @
                                    </span>
                                    <Input
                                        id="handle"
                                        value={handle}
                                        onChange={(e) =>
                                            setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))
                                        }
                                        placeholder="username"
                                        required
                                        className="h-11 bg-card pl-7"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Letters, numbers, and underscores only.
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="h-11 bg-card"
                                />
                                <p className="text-xs text-muted-foreground">
                                    You can't change this later.
                                </p>
                            </div>

                        </div>

                        <div className="space-y-2">
                            <Button
                                type="submit"
                                className="w-full h-11"
                                disabled={sendingCode}
                            >
                                {sendingCode ? "Sending link..." : "Sign up"}
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full h-11"
                                onClick={() => { setStep(1); setFormError(null); }}
                            >
                                Back
                            </Button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    <div className="space-y-5">
                        <div>
                            <h2 className="text-xl font-extrabold tracking-tight text-primary">
                                Check your email.
                            </h2>
                            <p className="mt-1 text-sm text-muted-foreground">
                                We sent a sign-in link to finish creating your account.
                            </p>
                        </div>

                        <div className="rounded-xl bg-card border border-primary/20 px-4 py-3 text-center">
                            <p className="text-sm font-semibold text-primary mb-0.5">Link sent</p>
                            <p className="text-xs text-muted-foreground">
                                We sent a sign-in link to <span className="font-medium text-primary">{email}</span>
                            </p>
                        </div>
                    </div>
                )}

                <p className="mt-5 text-xs text-muted-foreground text-center">
                    Already have an account?{" "}
                    <a href="/login" className="text-primary cursor-pointer hover:text-primary/80 transition-colors">
                        Sign in
                    </a>
                </p>
            </div>
        </div>
    );
}
