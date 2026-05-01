// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

"use client";

// Libraries
import { useEffect, useRef, useState } from "react";
import { authClient } from "@/client/auth";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import Footer from "./quacky/footer";

const LOGIN_DRAFT_STORAGE_KEY = "quacky-login-draft";

export default function Login() {
    const getStoredDraft = () => {
        if (typeof window === "undefined") return null;

        try {
            const stored = window.sessionStorage.getItem(LOGIN_DRAFT_STORAGE_KEY);
            if (!stored) return null;

            return JSON.parse(stored) as {
                email?: string;
                codeSent?: boolean;
                otp?: string;
            };
        } catch {
            return null;
        }
    };

    // States
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [appInfo, setAppInfo] = useState<{ version: string }>({ version: "dev" });

    // Email + OTP states
    const storedDraft = getStoredDraft();
    const [email, setEmail] = useState(storedDraft?.email ?? "");
    const [codeSent, setCodeSent] = useState(storedDraft?.codeSent ?? false);
    const [emailPending, setEmailPending] = useState(false);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [otp, setOtp] = useState(storedDraft?.otp ?? "");
    const [otpPending, setOtpPending] = useState(false);
    const [otpError, setOtpError] = useState<string | null>(null);

    const otpRef = useRef<HTMLDivElement>(null);

    // Get version metadata
    useEffect(() => {
        const fetchAppInfo = async () => {
            try {
                const response = await fetch("/api");
                const data = await response.json();
                setAppInfo({ version: data.version });
            } catch (e: any) {
                console.error(e.message);
            }
        };
        fetchAppInfo();
    }, []);

    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!email && !codeSent && !otp) {
            window.sessionStorage.removeItem(LOGIN_DRAFT_STORAGE_KEY);
            return;
        }

        window.sessionStorage.setItem(
            LOGIN_DRAFT_STORAGE_KEY,
            JSON.stringify({
                email,
                codeSent,
                otp,
            })
        );
    }, [email, codeSent, otp]);

    // Focus OTP input when code is sent
    useEffect(() => {
        if (codeSent) {
            setTimeout(() => {
                otpRef.current?.querySelector("input")?.focus();
            }, 100);
        }
    }, [codeSent]);

    // GitHub Login
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

    // Send OTP
    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || emailPending) return;
        setEmailError(null);
        setEmailPending(true);

        try {
            const result = await authClient.emailOtp.sendVerificationOtp({
                email: email.trim(),
                type: "sign-in",
            });
            if (result?.error) {
                setEmailError(result.error.message ?? "Failed to send code. Please try again.");
            } else {
                setCodeSent(true);
                setOtp("");
            }
        } catch (err: any) {
            setEmailError(err.message ?? "Failed to send code. Please try again.");
        } finally {
            setEmailPending(false);
        }
    };

    // Verify OTP
    const handleVerifyOtp = async (value?: string) => {
        const code = value ?? otp;
        if (code.length !== 6 || otpPending) return;
        setOtpError(null);
        setOtpPending(true);

        try {
            const result = await authClient.signIn.emailOtp({
                email: email.trim(),
                otp: code,
                callbackURL: "/",
            });
            if (result?.error) {
                setOtpError(result.error.message ?? "Invalid code. Please try again.");
                setOtp("");
            } else if (typeof window !== "undefined") {
                window.sessionStorage.removeItem(LOGIN_DRAFT_STORAGE_KEY);
            }
        } catch (err: any) {
            setOtpError(err.message ?? "Invalid code. Please try again.");
            setOtp("");
        } finally {
            setOtpPending(false);
        }
    };

    const handleOtpChange = (value: string) => {
        setOtp(value);
        if (value.length === 6) handleVerifyOtp(value);
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
                            <div className="mb-4 w-full rounded bg-destructive/10 p-4 text-sm text-destructive">
                                There was an issue, please try again. {error}
                            </div>
                        )}

                        <Button
                            onClick={handleGithubLogin}
                            disabled={isPending}
                            className="w-full h-11 cursor-pointer flex items-center justify-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8" />
                            </svg>
                            {isPending ? "Redirecting..." : "Continue with GitHub"}
                        </Button>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground font-medium">or continue with</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        {/* Email / OTP flow */}
                        {!codeSent ? (
                            <form onSubmit={handleSendCode} className="space-y-2">
                                {emailError && (
                                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
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
                                    {emailPending ? "Sending code..." : "Continue with Email"}
                                </Button>
                            </form>
                        ) : (
                            <div className="space-y-3">
                                <div className="rounded-xl bg-card border border-primary/20 px-4 py-3 text-center">
                                    <p className="text-sm font-semibold text-primary mb-0.5">Check your email</p>
                                    <p className="text-xs text-muted-foreground">
                                        We sent a 6-digit code to <span className="font-medium text-primary">{email}</span>
                                    </p>
                                </div>

                                {otpError && (
                                    <div className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive text-center">
                                        {otpError}
                                    </div>
                                )}

                                <div ref={otpRef} className="flex flex-col items-center gap-3">
                                    <InputOTP
                                        maxLength={6}
                                        value={otp}
                                        onChange={handleOtpChange}
                                        disabled={otpPending}
                                        className="gap-2"
                                    >
                                        <InputOTPGroup>
                                            <InputOTPSlot index={0} className="w-11 h-11 text-base bg-card" />
                                            <InputOTPSlot index={1} className="w-11 h-11 text-base bg-card" />
                                            <InputOTPSlot index={2} className="w-11 h-11 text-base bg-card" />
                                            <InputOTPSlot index={3} className="w-11 h-11 text-base bg-card" />
                                            <InputOTPSlot index={4} className="w-11 h-11 text-base bg-card" />
                                            <InputOTPSlot index={5} className="w-11 h-11 text-base bg-card" />
                                        </InputOTPGroup>
                                    </InputOTP>

                                    {otpPending && (
                                        <p className="text-xs text-muted-foreground">Verifying...</p>
                                    )}
                                </div>

                                <button
                                    onClick={() => { setCodeSent(false); setOtp(""); setOtpError(null); }}
                                    className="w-full text-xs text-muted-foreground hover:text-primary underline underline-offset-2 transition-colors text-center"
                                >
                                    Use a different email
                                </button>
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
                                v{appInfo.version}
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
