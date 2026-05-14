//    ____                   _          
//   / __ \                 | |         
//  | |  | |_   _  __ _  ___| | ___   _ 
//  | |  | | | | |/ _` |/ __| |/ / | | |
//  | |__| | |_| | (_| | (__|   <| |_| |
//   \___\_\\__,_|\__,_|\___|_|\_\\__, |
//                                 __/ |
//                                |___/ 

"use client";

// Libraries
import { useState } from "react";
import { authClient } from "@/client/auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Footer from "./quacky/footer";
import { GithubIcon } from "./svgs";

export default function Login() {
    // states
    const [isPending, setIsPending] = useState(false);
    const [email, setEmail] = useState("");
    const [linkSent, setLinkSent] = useState(false);
    const [emailPending, setEmailPending] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);

    // Send magic link
    const sendLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailError(null);
        setEmailPending(true);

        try {
            const res = await authClient.signIn.magicLink(
                {
                    email: email.trim(),
                    callbackURL: "/",
                }
            );

            if (res.error) {
                throw new Error(res.error.message || "An unknown error occurred.");
            }

            setLinkSent(true);

        } catch (err: any) {
            setEmailError(err.message);
        } finally {
            setEmailPending(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-background relative px-4 py-8 sm:py-0">
            <div className="w-full max-w-sm">
                <div className="backdrop-blur-md p-6 sm:p-8">
                    
                    <div className="text-center">
                        <img src="/assets/logo/sleepy.png" alt="Quacky" className="w-32 h-32 sm:w-40 sm:h-40 object-contain mx-auto mb-0" />
                        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary dark:text-primary-dark">Sign in to Quacky</h1>
                        <p className="mt-2 text-sm text-muted-foreground">Login to continue exploring Quacky</p>
                    </div>

                    <div className="space-y-4 mt-6">

                        <Button
                            onClick={async () => {
                                setIsPending(true);

                                await authClient.signIn.social(
                                    {
                                        provider: "github",
                                        callbackURL: `${window.location.origin}/`,
                                    }
                                );

                            }}
                            disabled={isPending}
                            className="w-full h-11 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <GithubIcon />
                            {isPending ? "Redirecting..." : "Continue with GitHub"}
                        </Button>

                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground font-medium">or continue with</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {!linkSent ? (
                            <form onSubmit={sendLink} className="space-y-2">
                                {emailError && (
                                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                                        {emailError}
                                    </div>
                                )}
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Email address"
                                    required
                                    className="h-11 text-sm bg-card"
                                />
                                <Button
                                    type="submit"
                                    disabled={emailPending || !email.trim()}
                                    variant="default"
                                    className="w-full h-11 cursor-pointer"
                                >
                                    {emailPending ? "Sending link..." : "Continue with Email"}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <div className="rounded-xl bg-card px-4 py-3 text-center">
                                    <p className="text-sm font-semibold text-primary mb-0.5">Check your email</p>
                                    <p className="text-xs text-muted-foreground">
                                        We sent a sign-in link to <span className="font-medium text-primary">{email}</span>
                                    </p>
                                </div>
                            </div>
                        )}

                        <div>
                            <p className="text-xs text-muted-foreground text-center">
                                By signing in, you agree to abide by our{" "}
                                <a href="/terms" className="underline">Terms</a>,{" "}
                                <a href="/privacy" className="underline">Privacy Policy</a>, and{" "}
                                <a href="/community-guidelines" className="underline">Community Guidelines</a>.
                            </p>

                            <p className="mt-5 text-xs text-muted-foreground text-center">
                                Don't have an account?{" "}
                                <a href="/onboarding" className="underline">
                                    Sign up
                                </a>
                            </p>

                        </div>

                    </div>
                </div>
            </div>

            <div className="fixed bottom-4 left-0 right-0 text-center">
                <Footer />
            </div>
        </div>
    );
}
