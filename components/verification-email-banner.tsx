"use client";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/client/auth";

export function VerificationBanner() {
    const { data: session, isPending } = authClient.useSession();
    const [sending, setSending] = useState(false);

    if (isPending || !session || session.user.emailVerified) {
        return null;
    }

    async function resendVerificationEmail() {
        if (sending) return;
        setSending(true);

        const { error } = await authClient.sendVerificationEmail({
            email: session!.user.email,
        });

        setSending(false);

        if (error) {
            toast.error("something went wrong");
        } else {
            toast.success("verification email sent!");
        }
    }

    return (
        <div className="fixed top-0 left-0 right-0 z-50 w-full bg-destructive text-warning-foreground">
            <div className="flex items-center justify-center gap-2 px-4 text-sm">
                <span>
                    Please check your inbox for a verification email.
                </span>

                <button
                    type="button"
                    className="underline hover:no-underline disabled:opacity-50"
                    disabled={sending}
                    onClick={resendVerificationEmail}
                >
                    {sending ? "Sending…" : "Resend Email"}
                </button>
            </div>
        </div>
    );
}
