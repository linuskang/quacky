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
import { authClient } from "@/client/auth"
import Link from "next/link"
import Image from "next/image"
import { toast } from "sonner"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import Loading from "@/components/loading"

type Step = 1 | 2 | 3

// stepper made with ai.
function Stepper({ step }: { step: Step }) {
    const steps = ["Accept rules", "Your details", "Confirm email"]

    const fillWidth =
        step >= 3 ? "calc(100% - 2rem)" : step >= 2 ? "calc(50% - 1rem)" : "0px"

    return (
        <div className="relative mb-12 flex w-full items-start justify-between">
            <div className="absolute top-[15px] right-4 left-4 z-0 h-[2px] bg-border" />
            <div
                className="absolute top-[15px] left-4 z-0 h-[2px] bg-primary transition-all duration-500 ease-out"
                style={{ width: fillWidth }}
            />

            {steps.map((label, i) => {
                const num = (i + 1) as Step
                const completed = step > num
                const active = step === num

                return (
                    <div
                        key={label}
                        className="relative z-10 flex flex-col items-center rounded-full bg-background"
                    >
                        <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold transition-all duration-300 ${completed
                                ? "border-primary bg-primary text-primary-foreground"
                                : active
                                    ? "border-primary bg-background text-primary"
                                    : "border-border bg-background text-muted-foreground"
                                }`}
                        >
                            {completed ? (
                                <Check className="h-4 w-4" strokeWidth={4} />
                            ) : (
                                num
                            )}
                        </div>
                        <span
                            className={`absolute top-10 text-xs whitespace-nowrap transition-colors duration-300 ${active
                                ? "font-medium text-foreground"
                                : completed
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }`}
                        >
                            {label}
                        </span>
                    </div>
                )
            })}
        </div>
    )
}

export default function Page() {
    const [step, setStep] = useState<Step>(1)
    const [name, setName] = useState("")
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [agreed, setAgreed] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [rules, setRules] = useState<
        { title: string; description: string }[]
    >([])
    const [orgName, setOrgName] = useState("")
    const [loadingAssets, setLoadingAssets] = useState(true)

    useEffect(() => {
        async function loadMeta() {
            try {
                const res = await fetch("/api/meta")
                const data = await res.json()

                setRules(data.org.rules)
                setOrgName(data.org.name)
            } catch (err) {
                toast.error(
                    err instanceof Error
                        ? err.message
                        : "Failed to load metadata."
                )
            } finally {
                setLoadingAssets(false)
            }
        }

        loadMeta()
    }, [])

    const createAccount = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!agreed) {
            setError("You must agree to the Terms of Service to continue.")
            return
        }

        setLoading(true)

        await authClient.signUp.email({
            name,
            username: username.trim().toLowerCase(),
            email,
            password,
            callbackURL: "/",
            fetchOptions: {
                onRequest: () => {
                    setLoading(true)
                    setError("")
                },
                onSuccess: () => {
                    setLoading(false)
                    setStep(3)
                    toast.success(
                        "Account created successfully! Please check your email to verify your account."
                    )
                },
                onError: (ctx) => {
                    setLoading(false)
                    setError(ctx.error.message)
                },
            },
        })
    }

    return (
        <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8 sm:py-0">
            <div className="w-full max-w-xs">
                <div className="mb-6 text-center">
                    <Image
                        src="/goose/Academic Scroll.png"
                        alt="Quacky Logo"
                        width={120}
                        height={120}
                        priority
                        className="mx-auto mb-4 h-auto w-auto"
                    />
                    <h1 className="text-center text-3xl font-extrabold text-primary">
                        Join {orgName}
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Existing user?{" "}
                        <Link
                            href="/auth/login"
                            className="text-primary-2 hover:underline"
                        >
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
                        <div className="space-y-0 overflow-hidden rounded-xl border-2 border-border bg-card">
                            {rules?.map((rule, i) => (
                                <div key={rule.title}>
                                    <div className="flex gap-3 px-4 py-3.5">
                                        <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                            {i + 1}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm leading-snug font-semibold text-foreground">
                                                {rule.title}
                                            </p>
                                            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                                                {rule.description}
                                            </p>
                                        </div>
                                    </div>
                                    {i < rules.length - 1 && (
                                        <Separator className="border-1 bg-border" />
                                    )}
                                </div>
                            ))}
                        </div>
                        <Button
                            onClick={() => setStep(2)}
                            className="h-11 w-full text-base"
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
                                className="h-8 border-2 border-border !bg-card transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]"
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
                                className="h-8 border-2 border-border !bg-card transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]"
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
                                className="h-8 border-2 border-border !bg-card transition focus-visible:border-transparent focus-visible:ring-2 focus-visible:ring-[hsl(288,100%,86%)]"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="flex items-start gap-2 pt-1">
                            <Checkbox
                                id="terms"
                                checked={agreed}
                                className="border-2"
                                onCheckedChange={(checked) =>
                                    setAgreed(checked === true)
                                }
                            />
                            <Label
                                htmlFor="terms"
                                className="mt-0.5 cursor-pointer text-sm leading-none text-muted-foreground"
                            >
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
                            className="h-11 w-full rounded-full bg-primary text-base"
                            disabled={loading || !agreed}
                        >
                            {loading ? "Creating account..." : "Create Account"}
                        </Button>
                    </form>
                )}

                {step === 3 && (
                    <div className="space-y-6 text-center">
                        <div className="space-y-4 rounded-lg border-2 border-border p-6">
                            <Image
                                src="/goose/Celebration.png"
                                alt="A celebrating goose"
                                width={112}
                                height={112}
                                className="mx-auto h-24 w-24 object-contain"
                            />
                            <div className="space-y-2">
                                <p className="text-sm text-muted-foreground">
                                    We&apos;ve sent a verification link to{" "}
                                    <span className="font-medium text-foreground">
                                        {email}
                                    </span>
                                    . Click the link to verify your account.
                                </p>
                            </div>
                        </div>
                        <Button asChild className="h-11 w-full text-base">
                            <Link href="/auth/login">Go to Login</Link>
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
