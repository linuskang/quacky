// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { authClient } from "@/client/auth";
import { Button } from "@/components/ui/button";
import Footer from "@/components/quacky/footer";
import Image from "next/image";

type InviteInfo = {
    email: string;
    handle: string;
    displayName: string;
    expiresAt: string | null;
};

type PageStatus = "loading" | "valid" | "invalid" | "used" | "expired";

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = use(params);

    const [pageStatus, setPageStatus] = useState<PageStatus>("loading");
    const [invite, setInvite] = useState<InviteInfo | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [linkSent, setLinkSent] = useState(false);
    const [sendingLink, setSendingLink] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const handleBinClick = () => {
        const url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
        window.open(url, "_blank");
    };

    const [isBinHovered, setIsBinHovered] = useState(false);

    useEffect(() => {
        fetch(`/api/v1/invite/${token}`)
            .then(async (res) => {
                const data = await res.json();
                if (res.ok && data.invite) {
                    setInvite(data.invite);
                    setPageStatus("valid");
                } else {
                    setErrorMessage(data.error ?? "This invitation is not valid.");
                    setPageStatus((data.status as PageStatus) ?? "invalid");
                }
            })
            .catch(() => {
                setErrorMessage("Failed to load invitation.");
                setPageStatus("invalid");
            });
    }, [token]);

    const handleAccept = async () => {
        if (!invite || sendingLink) return;
        setSendingLink(true);
        setSendError(null);

        const result = await authClient.signIn.magicLink({
            email: invite.email,
            callbackURL: "/",
        });

        if (result?.error) {
            const msg = (result.error as any).message ?? (result.error as any).error?.message;
            setSendError(msg ?? "Failed to send link. Please try again.");
        } else {
            setLinkSent(true);
        }

        setSendingLink(false);
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

                    {pageStatus === "valid" && invite && (
                        <div className="space-y-5">
                            <div className="rounded-xl border border-primary/20 bg-card px-5 py-4 text-center space-y-1">
                                <p className="text-sm text-muted-foreground">You&apos;ve been invited to join Quacky as</p>
                                <p className="text-xl font-bold text-foreground">{invite.displayName}</p>
                                <p className="text-sm font-medium text-primary">@{invite.handle}</p>
                                {invite.expiresAt && (
                                    <p className="text-xs text-muted-foreground pt-1">
                                        Expires {new Date(invite.expiresAt).toLocaleDateString("en-AU", { dateStyle: "medium" })}
                                    </p>
                                )}
                            </div>

                            {!linkSent ? (
                                <div className="space-y-3">
                                    {sendError && (
                                        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive text-center">
                                            {sendError}
                                        </div>
                                    )}
                                    <Button
                                        className="w-full h-11"
                                        onClick={handleAccept}
                                        disabled={sendingLink}
                                    >
                                        {sendingLink ? "Sending link..." : "Accept Invitation"}
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="rounded-xl bg-card border border-primary/20 px-4 py-3 text-center">
                                        <p className="text-sm font-semibold text-primary mb-0.5">Check your email</p>
                                        <p className="text-xs text-muted-foreground">
                                            We sent a sign-in link to{" "}
                                            <span className="font-medium text-primary">{invite.email}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => { setLinkSent(false); setSendError(null); }}
                                        className="w-full text-xs text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors text-center"
                                    >
                                        Resend link
                                    </button>
                                </div>
                            )}
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
