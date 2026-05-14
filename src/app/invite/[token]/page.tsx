// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Footer from "@/components/quacky/footer";
import Image from "next/image";

type InviteInfo = {
    email: string;
    handle: string;
    displayName: string;
    expiresAt: string | null;
};

type Rule = {
    title: string;
    description: string;
};

type PageStatus = "loading" | "rules" | "accept" | "invalid" | "used" | "expired" | "accepted";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);

    const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
    const [invite, setInvite] = useState<InviteInfo | null>(null);
    const [rules, setRules] = useState<Rule[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [accepting, setAccepting] = useState(false);
    const [acceptError, setAcceptError] = useState<string | null>(null);

    const [isBinHovered, setIsBinHovered] = useState(false);

    const handleBinClick = () => {
        window.open("https://www.youtube.com/watch?v=dQw4w9WgXcQ", "_blank");
    };

    useEffect(() => {
        Promise.all([
            fetch(`/api/v1/invite/${token}`).then((r) => r.json().then((d) => ({ ok: r.ok, ...d }))),
            fetch("/api/v1/meta").then((r) => r.json()),
        ]).then(([inviteData, metaData]) => {
            if (inviteData.ok && inviteData.invite) {
                setInvite(inviteData.invite);
                setRules(metaData.rules ?? []);
                setPageStatus("rules");
            } else {
                setErrorMessage(inviteData.error ?? "This invitation is not valid.");
                setPageStatus((inviteData.status as PageStatus) ?? "invalid");
            }
        }).catch(() => {
            setErrorMessage("Failed to load invitation.");
            setPageStatus("invalid");
        });
    }, [token]);

    const handleAccept = async () => {
        if (!invite || accepting) return;
        setAccepting(true);
        setAcceptError(null);

        try {
            const res = await fetch(`/api/v1/invite/${token}`, { method: "POST" });
            const data = await res.json();

            if (res.ok) {
                setPageStatus("accepted");
            } else {
                setAcceptError(data.error ?? "Something went wrong. Please try again.");
            }
        } catch {
            setAcceptError("Something went wrong. Please try again.");
        }

        setAccepting(false);
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background px-4 py-8">
            <div className="w-full max-w-sm">
                <div className="p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <img
                            src="/assets/logo/sleepy.png"
                            alt="Quacky"
                            className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto"
                        />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary">
                            You&apos;re invited!
                        </h1>
                    </div>

                    {pageStatus === "loading" && (
                        <p className="text-center text-muted-foreground text-sm">Loading invitation...</p>
                    )}

                    {pageStatus === "rules" && (
                        <div className="space-y-5">
                            <div>
                                <h2 className="text-xl font-extrabold tracking-tight text-primary">
                                    Some ground rules.
                                </h2>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Read and accept these before joining.
                                </p>
                            </div>

                            {rules.length > 0 && (
                                <div className="space-y-0 rounded-xl border border-border overflow-hidden bg-card">
                                    {rules.map((rule, i) => (
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
                            )}

                            <Button className="w-full h-11" onClick={() => setPageStatus("accept")}>
                                Accept Rules
                            </Button>
                        </div>
                    )}

                    {pageStatus === "accept" && invite && (
                        <div className="space-y-5">
                            <div className="rounded-xl bg-card px-5 py-4 text-center space-y-1">
                                <p className="text-sm text-muted-foreground">You&apos;ve been invited to join Quacky as</p>
                                <p className="text-xl font-bold text-foreground">{invite.displayName}</p>
                                <p className="text-sm font-medium text-primary">@{invite.handle}</p>
                                {invite.expiresAt && (
                                    <p className="text-xs text-muted-foreground pt-1">
                                        Expires {new Date(invite.expiresAt).toLocaleDateString("en-AU", { dateStyle: "medium" })}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-3">
                                {acceptError && (
                                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive text-center">
                                        {acceptError}
                                    </div>
                                )}
                                <Button
                                    className="w-full h-11"
                                    onClick={handleAccept}
                                    disabled={accepting}
                                >
                                    {accepting ? "Creating account..." : "Accept Invitation"}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full h-11"
                                    onClick={() => { setAcceptError(null); setPageStatus("rules"); }}
                                >
                                    Back
                                </Button>
                            </div>
                        </div>
                    )}

                    {pageStatus === "accepted" && invite && (
                        <div className="space-y-4 text-center">
                            <div className="rounded-xl bg-card px-5 py-4 space-y-1">
                                <p className="text-sm font-semibold text-primary mb-0.5">Account created!</p>
                                <p className="text-xs text-muted-foreground">
                                    Your account has been created for{" "}
                                    <span className="font-medium text-primary">{invite.email}</span>
                                    . Head to login to sign in.
                                </p>
                            </div>
                            <a href="/login" className="block w-full">
                                <Button className="w-full h-11">Sign in</Button>
                            </a>
                        </div>
                    )}

                    {(pageStatus === "invalid" || pageStatus === "used" || pageStatus === "expired") && (
                        <div className="space-y-4 text-center">
                            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4">
                                <p className="text-sm font-semibold text-destructive mb-1">
                                    {pageStatus === "used" && "Invitation already used"}
                                    {pageStatus === "expired" && "Invitation expired"}
                                    {pageStatus === "invalid" && "Invalid invitation"}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {errorMessage ?? "This invitation link is not valid."}
                                </p>
                            </div>
                            <a href="/login" className="block text-sm text-primary hover:underline">
                                Sign in to an existing account
                            </a>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                aria-label="Toggle corner asset"
                className="fixed -bottom-10 -right-15 z-0 cursor-pointer pointer-events-auto transition-transform duration-200 hover:scale-110 active:scale-95"
                onClick={handleBinClick}
                onMouseEnter={() => setIsBinHovered(true)}
                onMouseLeave={() => setIsBinHovered(false)}
            >
                <Image
                    src={isBinHovered ? "/assets/bin/open.png" : "/assets/bin/close.png"}
                    alt="Corner asset"
                    width={220}
                    height={220}
                    sizes="220px"
                    priority
                    className="h-auto w-56"
                />
            </button>

            <div className="fixed bottom-4 left-0 right-0 text-center">
                <Footer />
            </div>
        </div>
    );
}
