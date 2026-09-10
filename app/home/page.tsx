"use client"

import axios from "axios"
import Image from "next/image"
import { playfairDisplay } from "@/lib/fonts"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function Page() {
    const [orgName, setOrgName] = useState("")
    const [members, setMembers] = useState(0)
    const [email, setEmail] = useState("")
    useEffect(() => {
        async function getName() {
            await axios.get("/api/meta").then((res) => {
                setOrgName(res.data.org.name)
                setMembers(res.data.stats.users)
            })
        }

        getName()
    }, [])
    return (
        <>
            <div className="flex h-7 items-center justify-center gap-1 border-b border-primary-2 bg-primary-2 px-4 text-sm font-medium text-background">
                <span>This is Linus&apos;s demo of Quacky for {orgName}.</span>
                <Link href="/devlog" className="underline">
                    Hey, what is Quacky?
                </Link>
            </div>
            <div className="relative min-h-[65vh] overflow-hidden border-b-2 border-border bg-[linear-gradient(to_bottom,var(--homepage-primary)_0%,var(--homepage-primary)_35%,color-mix(in_oklch,var(--homepage-primary),var(--background)_60%)_75%,var(--background)_100%)] pb-8">
                <Image
                    src="/quacky.png"
                    alt="Logo"
                    width={300}
                    height={150}
                    className="ml-6 h-auto w-90 pt-6"
                />

                <Image
                    src="/goose/V%20Formation.svg"
                    alt=""
                    width={700}
                    height={500}
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-[54%] z-0 w-[38rem] -translate-x-1/2 -translate-y-1/2 rotate-[-8deg] object-contain opacity-90"
                />

                <div className="relative z-10 mt-20 max-w-[560px] lg:ml-40">
                    <p className="text-lg font-medium text-muted-foreground">
                        A project by <Link href="https://github.com/linuskang" className="underline">Linus Kang</Link>, 2026.
                    </p>
                    <h1 className="mt-6 w-max text-8xl font-extrabold leading-[0.95] tracking-tight drop-shadow-[0_0_16px_rgba(255,255,255,0.5)]">
                        Social media,
                        <br />
                        for <span className={`${playfairDisplay.className} italic text-primary-2`}>Schools.</span>
                    </h1>
                    <p className="mt-8 max-w-[500px] text-lg leading-relaxed text-muted-foreground">
                        Educate teenagers on responsible social media use through the power of Quacky.
                        <br />
                        <br />
                        Interactive lessons, fully functioning social platform, warm fuzzies, and UGC. All in one platform for schools.
                    </p>

                    <div className="mt-6">
                        <p className="text-sm text-muted-foreground">Sign into <strong className="text-primary-2">{orgName}</strong></p>
                        <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">

                            <Input
                                type="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                className="h-12 min-w-0 flex-1 rounded-none !text-lg border-primary-2 !bg-homepage-input p-4 text-lg transition focus:!ring-2 focus:!ring-ring focus:ring-offset-2 focus:ring-offset-background"
                                placeholder="m@quacky.space"
                            />

                            <Button
                                className="h-12 shrink-0 rounded-none !bg-primary-2 px-6 text-lg !text-background hover:!bg-primary-2/90 focus:!ring-2 focus:!ring-ring"
                                onClick={() => {
                                    window.location.href = `/auth/login?email=${encodeURIComponent(email)}`
                                }}
                            >
                                Sign In
                            </Button>
                        </div>
                    </div>
                    <div className="mt-1 text-xs text-primary-2">
                        Join {members} other students on QACI!
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/register" className="underline">
                            Sign up
                        </Link>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground">
                        Are you a teacher?{" "}
                        <Link href="/auth/register" className="underline">
                            See teaching resources
                        </Link>
                    </div>
                </div>
            </div >

            <div className="bg-background">
                <p>hi</p>
            </div>
        </>
    )
}
