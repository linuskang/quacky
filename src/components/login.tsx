// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { useEffect, useState } from "react";
import { authClient } from "@/client/auth";

// UI Components
import { Button } from "@/components/ui/button";

export default function Login() {
    // States
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [appInfo, setAppInfo] = useState<{ version: string; build: string }>({ version: "dev", build: "dev build" });

    // Get version metadata
    useEffect(() => {
        const fetchAppInfo = async () => {
            try {
                const response = await fetch("/api");
                const data = await response.json();
                setAppInfo({ version: data.version, build: data.build });
            } catch (e) {
                console.error("Failed to fetch app info");
            }
        };
        fetchAppInfo();
    }, []);

    // GitHub Login Handler
    const handleGithubLogin = async () => {
        setError(null);
        setIsPending(true);

        try {
            await authClient.signIn.social({
                provider: "github",
                callbackURL: `${window.location.origin}/`,
            });
        } catch (err: any) {
            setError(err.message);
            setIsPending(false);
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
                        {error && (
                            <div className="mb-4 w-full rounded bg-red-100 p-4 text-sm text-red-700">
                                There was an issue, please try again. {error}
                            </div>
                        )}

                        <Button
                            onClick={handleGithubLogin}
                            disabled={isPending}
                            className="w-full h-11 cursor-pointer flex items-center justify-center"
                        >
                            {isPending ? "Redirecting..." : "Continue with GitHub"}
                        </Button>

                        <div className="space-y-4">
                            <p className="text-xs text-muted-foreground text-center">
                                By signing in, you agree to abide by our{" "}
                                <a href="/terms" className="underline">Terms</a>,{" "}
                                <a href="/privacy" className="underline">Privacy Policy</a>, and{" "}
                                <a href="/community-guidelines" className="underline">Community Guidelines</a>.
                            </p>

                            <p className="text-xs text-muted-foreground text-center">
                                Don't have an account?{" "}
                                <a href="/onboarding" className="underline">
                                    Sign up
                                </a>
                            </p>

                            <p className="mt-8 text-xs text-muted-foreground text-center">
                                {appInfo.version} ({appInfo.build})
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
