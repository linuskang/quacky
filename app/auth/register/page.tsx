"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/client/auth";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import Loading from "@/components/loading"

type Step = 1 | 2 | 3;

// stepper made with ai.
function Stepper({ step }: { step: Step }) {
    const steps = ["Accept rules", "Your details", "Confirm email"];

    const fillWidth =
        step >= 3 ? "calc(100% - 2rem)" : step >= 2 ? "calc(50% - 1rem)" : "0px";

    return (
        <div className="relative flex justify-between items-start mb-12 w-full">
            <div className="absolute left-4 right-4 top-[15px] h-[2px] bg-border z-0" />
            <div
                className="absolute left-4 top-[15px] h-[2px] bg-primary z-0 transition-all duration-500 ease-out"
                style={{ width: fillWidth }}
            />

            {steps.map((label, i) => {
                const num = (i + 1) as Step;
                const completed = step > num;
                const active = step === num;

                return (
                    <div key={label} className="relative z-10 flex flex-col items-center bg-background rounded-full">
                        <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300 ${completed
                                ? "bg-primary border-primary text-primary-foreground"
                                : active
                                    ? "border-primary bg-background text-primary"
                                    : "border-border bg-background text-muted-foreground"
                                }`}
                        >
                            {completed ? (
                                <Check className="w-4 h-4" strokeWidth={4} />
                            ) : (
                                num
                            )}
                        </div>
                        <span
                            className={`absolute top-10 text-xs whitespace-nowrap transition-colors duration-300 ${active
                                ? "text-foreground font-medium"
                                : completed
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

export default function Page() {
    const [step, setStep] = useState<Step>(1);
    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rules, setRules] = useState<{ title: string; description: string }[]>([]);
    const [orgName, setOrgName] = useState("");
    const [loadingAssets, setLoadingAssets] = useState(false);

    useEffect(() => {
        setLoadingAssets(true);
        fetch("/api/meta")
            .then((res) => res.json())
            .then((data) => {
                setRules(data.org.rules);
                setOrgName(data.org.name);
            })
            .catch((err) => {
                toast.error(err.message);
            });
        setLoadingAssets(false);
    }, [])

    const createAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!agreed) {
            setError("You must agree to the Terms of Service to continue.");
            return;
        }

        setLoading(true);

        await authClient.signUp.email({
            name,
            username: username.trim().toLowerCase(),
            email,
            password,
            callbackURL: "/",
            fetchOptions: {
                onRequest: () => {
                    setLoading(true);
                    setError("");
                },
                onSuccess: () => {
                    setLoading(false);
                    setStep(3);
                    toast.success("Account created successfully! Please check your email to verify your account.");
                },
                onError: (ctx) => {
                    setLoading(false);
                    setError(ctx.error.message);
                }
            }
        });
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative px-4 py-8 sm:py-0">
            <div className="w-full max-w-xs">
                <div className="text-center mb-6">
                    <Image
                        src="/logo.png"
                        alt="Quacky Logo"
                        width={100}
                        height={100}
                        priority
                        className="mx-auto mb-4 h-auto w-auto"
                    />
                    <h1 className="text-primary text-3xl font-extrabold text-center">
                        Join {orgName}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Existing user?{" "}
                        <Link href="/auth/login" className="text-primary-2 hover:underline">
                            Sign in
                        </Link>
                    </p>
                </div>

                <Stepper step={step} />

                {loadingAssets && <Loading />}

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
                        <div className="space-y-0 rounded-xl border-2 border-border overflow-hidden bg-card">
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
                                    {i < rules.length - 1 && <Separator className="bg-border border-1" />}
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() => setStep(2)}
                            className="text-base w-full h-11"
                        >
                            I Accept the Rules
                        </Button>
                    </div>
                )}

                {step === 2 && (
                    <form onSubmit={createAccount} className="space-y-3">
                        <div>
                            <Label htmlFor="name" className="mb-1">
                                Your Name
                            </Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                className="!bg-card transition border-2 border-border focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="username" className="mb-1">
                                Your Username
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                value={username}
                                className="!bg-card transition border-2 border-border focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <Label htmlFor="email" className="mb-1">
                                Your Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                className="!bg-card transition border-2 border-border focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
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
                                className="!bg-card transition border-2 border-border focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)] h-8"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-start gap-2 pt-1">
                            <Checkbox
                                id="terms"
                                checked={agreed}
                                className="border-2"
                                onCheckedChange={(checked) => setAgreed(checked === true)}
                            />
                            <Label htmlFor="terms" className="text-sm text-muted-foreground leading-none mt-0.5 cursor-pointer">
                                I agree to the
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
                            <div className="rounded-md border-2 border-destructive bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="default"
                            className="text-base bg-primary rounded-full w-full h-11"
                            disabled={loading || !agreed}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                )}

                {step === 3 && (
                    <div className="text-center space-y-6">
                        <div className="rounded-lg border-2 border-border p-6 space-y-4">
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    We&apos;ve sent a verification link to{" "}
                                    <span className="text-foreground font-medium">{email}</span>. Click the link to verify your account.
                                </p>
                            </div>
                        </div>
                        <Button asChild className="text-base w-full h-11">
                            <Link href="/auth/login">Go to Login</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
