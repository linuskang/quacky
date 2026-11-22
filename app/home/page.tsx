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

import Image from "next/image"
import { playfairDisplay } from "@/lib/fonts"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { trpc } from "@/lib/trpc"

export default function Page() {
    const router = useRouter()
    const [email, setEmail] = useState("")
    const { data: meta } = trpc.meta.get.useQuery()
    const orgName = meta?.org.name ?? ""
    const members = meta?.stats.users ?? 0

    const handleSignIn = (e: React.FormEvent) => {
        e.preventDefault()
        router.push(`/auth/login?email=${encodeURIComponent(email)}`)
    }

    return (
        <div className="flex min-h-screen flex-col bg-background">
            <div className="flex min-h-7 flex-wrap items-center justify-center gap-x-2 gap-y-0.5 border-b border-primary-2 bg-primary-2 px-4 py-1 text-center text-xs font-medium text-background sm:text-sm">
                <span>
                    This is Linus&apos;s demo of Quacky
                    {orgName ? ` for ${orgName}` : ""}.
                </span>
                <Link
                    href="/devlog"
                    className="underline underline-offset-2 hover:opacity-80"
                >
                    Hey, what is Quacky?
                </Link>
            </div>

            <div className="relative overflow-hidden border-b-2 border-border bg-[linear-gradient(to_bottom,var(--homepage-primary)_0%,var(--homepage-primary)_35%,color-mix(in_oklch,var(--homepage-primary),var(--background)_60%)_75%,var(--background)_100%)] pb-12 sm:pb-16 md:pb-20">
                <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
                    <div className="pt-5 sm:pt-6">
                        <Image
                            src="/quacky.png"
                            alt="Quacky Logo"
                            width={300}
                            height={150}
                            priority
                            className="h-auto w-36 max-w-[70vw] sm:w-48 md:w-56 lg:w-64"
                        />
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:mt-10 md:grid-cols-12 md:items-center md:gap-8 lg:gap-12">
                        <div className="z-10 max-w-[560px] md:col-span-7 xl:col-span-7">
                            <p className="text-sm font-medium text-muted-foreground sm:text-base md:text-lg">
                                A project for the{" "}
                                <Link
                                    href="https://www.example.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="underline hover:text-foreground"
                                >
                                    2026 Premier&apos;s Coding Challenge
                                </Link>
                                .
                            </p>

                            <h1 className="mt-3 text-4xl leading-[1.05] font-extrabold tracking-tight drop-shadow-[0_0_16px_rgba(255,255,255,0.5)] sm:mt-5 sm:text-5xl sm:leading-[0.95] md:text-5xl lg:text-6xl xl:text-7xl">
                                Social media
                                <br />
                                for{" "}
                                <span
                                    className={`${playfairDisplay.className} text-primary-2 italic`}
                                >
                                    Schools.
                                </span>
                            </h1>

                            <p className="mt-3 max-w-[500px] text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg">
                                Educate teenagers on responsible social media
                                use through the power of Quacky.
                            </p>

                            {/* Sign-In Form */}
                            <div className="mt-5 sm:mt-7">
                                <p className="text-sm text-muted-foreground">
                                    Sign into{" "}
                                    <strong className="text-primary-2">
                                        {orgName || "Quacky"}
                                    </strong>
                                </p>
                                <form
                                    onSubmit={handleSignIn}
                                    className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center"
                                >
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(event) =>
                                            setEmail(event.target.value)
                                        }
                                        className="h-12 min-w-0 flex-1 rounded-none border-primary-2 !bg-homepage-input p-4 text-base transition focus:!ring-2 focus:!ring-ring focus:ring-offset-2 focus:ring-offset-background sm:text-lg"
                                        placeholder="m@quacky.space"
                                        aria-label="School email address"
                                    />
                                    <Button
                                        type="submit"
                                        className="h-12 w-full shrink-0 cursor-pointer rounded-none !bg-primary-2 px-6 text-base !text-background hover:!bg-primary-2/90 focus:!ring-2 focus:!ring-ring sm:w-auto sm:text-lg"
                                    >
                                        Sign In
                                    </Button>
                                </form>
                            </div>

                            <div className="mt-2 text-xs font-medium text-primary-2">
                                Join {members} other students on Quacky!
                            </div>

                            <div className="mt-4 flex flex-col text-sm text-muted-foreground sm:flex-row sm:gap-4">
                                Don&apos;t have an account?{" "}
                                <Link
                                    href="/auth/register"
                                    className="font-medium underline underline-offset-2 hover:text-foreground"
                                >
                                    Sign up
                                </Link>
                                Are you a teacher?{" "}
                                <Link
                                    href="/auth/register"
                                    className="font-medium underline underline-offset-2 hover:text-foreground"
                                >
                                    See teaching resources
                                </Link>
                            </div>
                        </div>

                        {/* Right Column: Quacky Geese Illustration (Side-by-side, never overlaps text) */}
                        <div className="mt-8 flex justify-center md:col-span-5 md:mt-0 md:justify-end xl:col-span-5">
                            <Image
                                src="/goose/V%20Formation.svg"
                                alt="Quacky geese in V formation"
                                width={700}
                                height={500}
                                priority
                                className="h-auto w-full max-w-[16rem] rotate-[-6deg] object-contain select-none sm:max-w-[20rem] md:max-w-[24rem] lg:max-w-[30rem] xl:max-w-[34rem]"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-8 lg:px-12">
                <h1>hi</h1>
            </div>
        </div>
    )
}
