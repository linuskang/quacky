"use client";

import { Suspense, useEffect, useRef, useState } from "react";

import { authClient } from "@/client/auth";
import { formatTimestamp } from "@/client/utils";

import Sidebar from "@/components/quacky/sidebar";
import Login from "@/components/login";
import Loading from "@/components/loading";
import { ReportAbuse } from "@/components/quacky/report";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, Heart, Search, Send, Sparkles, X } from "lucide-react";
import type { WarmFuzzy } from "@/types";

interface DMUserPreview {
    id: string;
    name: string;
    handle: string;
    image: string | null;
    verified: boolean;
}

interface SearchResponse {
    success: boolean;
    users: DMUserPreview[];
}

const REPORT_REASONS = [
    { value: "harassment", label: "Harassment or bullying" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "spam", label: "Spam" },
    { value: "self-harm", label: "Self-harm or dangerous content" },
    { value: "other", label: "Other" },
] as const;

export default function FuzziesPage() {
    return (
        <Suspense fallback={<Loading />}>
            <FuzziesPageContent />
        </Suspense>
    );
}

function FuzziesPageContent() {
    const { data: session, isPending } = authClient.useSession();

    const [fuzzies, setFuzzies] = useState<WarmFuzzy[]>([]);
    const [loadingBag, setLoadingBag] = useState(true);

    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<DMUserPreview[]>([]);
    const [selectedRecipient, setSelectedRecipient] = useState<DMUserPreview | null>(null);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [sendSuccess, setSendSuccess] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);

    const [reportingId, setReportingId] = useState<string | null>(null);
    const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

    const searchAbortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        if (!session) return;
        loadBag();
    }, [session]);

    useEffect(() => {
        const normalized = searchQuery.trim();

        if (!normalized || selectedRecipient) {
            setSearchResults([]);
            return;
        }

        searchAbortRef.current?.abort();
        const controller = new AbortController();
        searchAbortRef.current = controller;

        const timer = setTimeout(async () => {
            try {
                const res = await fetch(
                    `/api/v1/messages/users/search?q=${encodeURIComponent(normalized)}`,
                    { signal: controller.signal }
                );
                const data = await res.json() as SearchResponse;
                if (data.success) setSearchResults(data.users ?? []);
            } catch {
                // aborted or network error
            }
        }, 250);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [searchQuery, selectedRecipient]);

    async function loadBag() {
        try {
            setLoadingBag(true);
            const res = await fetch("/api/v1/fuzzies");
            const data = await res.json();
            if (data.success) setFuzzies(data.fuzzies ?? []);
        } finally {
            setLoadingBag(false);
        }
    }

    function selectRecipient(user: DMUserPreview) {
        setSelectedRecipient(user);
        setSearchQuery(user.handle);
        setSearchResults([]);
    }

    function clearRecipient() {
        setSelectedRecipient(null);
        setSearchQuery("");
        setSearchResults([]);
        setSendError(null);
    }

    async function handleSend() {
        if (!selectedRecipient || !message.trim() || sending) return;

        setSending(true);
        setSendError(null);

        try {
            const res = await fetch("/api/v1/fuzzies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recipientHandle: selectedRecipient.handle,
                    message: message.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setSendError(data.error ?? "Something went wrong.");
                return;
            }

            setSendSuccess(true);
            setSelectedRecipient(null);
            setSearchQuery("");
            setMessage("");
            setTimeout(() => setSendSuccess(false), 4000);
        } catch {
            setSendError("Could not send. Please try again.");
        } finally {
            setSending(false);
        }
    }

    async function handleReport(fuzzyId: string, type: string, reason: string) {
        const reportLabel = reason.trim() || (REPORT_REASONS.find((r) => r.value === type)?.label ?? type);

        const res = await fetch(`/api/v1/fuzzies/${fuzzyId}/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason: reportLabel }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
            throw new Error(data.error ?? "Could not submit report.");
        }

        setReportedIds((prev) => new Set([...prev, fuzzyId]));
        setReportingId(null);
    }

    if (isPending) return <Loading />;
    if (!session) return <Login />;

    const charsLeft = 280 - message.length;
    const visibleFuzzies = fuzzies.filter(f => !f.isReported && !reportedIds.has(f.id));

    return (
        <main className="min-h-screen w-full flex flex-col items-center bg-background">
            <div className="flex w-full max-w-[1200px] flex-1 gap-4 px-4 pb-24 lg:pb-8">
                <Sidebar session={session} />

                <section className="flex-1 flex flex-col gap-4 pt-8 w-full min-w-0">

                    {/* Page header */}
                    <div className="flex items-center gap-3">
                        <div>
                            <h1 className="text-2xl font-extrabold text-primary tracking-tight">Warm Fuzzies</h1>
                            <p className="text-sm text-muted-foreground">Send kind, anonymous notes to brighten someone&apos;s day.</p>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 items-start">

                        {/* ── Left: Your Bag ── */}
                        <div className="flex-1 min-w-0 w-full">
                            <div className="rounded-xl border border-border bg-[var(--lynt)]">
                                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-primary">Your Fuzzy Bag</h2>
                                    </div>
                                    {!loadingBag && (
                                        <span className="text-xs font-semibold text-muted-foreground">
                                            {visibleFuzzies.length} {visibleFuzzies.length === 1 ? "fuzzy" : "fuzzies"}
                                        </span>
                                    )}
                                </div>

                                {loadingBag && (
                                    <div className="p-8 text-center text-sm text-muted-foreground">Loading your bag...</div>
                                )}

                                {!loadingBag && visibleFuzzies.length === 0 && (
                                    <div className="flex flex-col items-center justify-center p-12 text-center gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-primary">Your bag is empty</p>
                                            <p className="mt-1 text-xs text-muted-foreground">Warm Fuzzies from others will appear here, anonymously.</p>
                                        </div>
                                    </div>
                                )}

                                {!loadingBag && visibleFuzzies.length > 0 && (
                                    <div className="divide-y divide-border">
                                        {visibleFuzzies.map((fuzzy) => (
                                            <FuzzyCard
                                                key={fuzzy.id}
                                                fuzzy={fuzzy}
                                                onStartReport={() => {
                                                    setReportingId(fuzzy.id);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ── Right: Send a Fuzzy ── */}
                        <div className="w-full lg:w-80 shrink-0">
                            {/* No overflow-hidden here — the search dropdown must be able to escape the card boundary */}
                            <div className="rounded-xl border border-border bg-[var(--lynt)]">
                                <div className="px-5 py-4 border-b border-border flex items-center gap-2">
                                    <h2 className="text-base font-bold text-primary">Send a Fuzzy</h2>
                                </div>

                                <div className="p-4 flex flex-col gap-3">
                                    {/* Recipient — position:relative on the inner wrapper only, no overflow:hidden above */}
                                    <div>
                                        <label className="text-xs font-semibold text-primary mb-1 block">To</label>
                                        <div className="relative">
                                            <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 bg-background/70 ${selectedRecipient ? "border-amber-400/60" : "border-border"}`}>
                                                {selectedRecipient ? (
                                                    <>
                                                        <Avatar className="size-5 shrink-0">
                                                            <AvatarImage src={selectedRecipient.image ?? ""} alt={selectedRecipient.name} />
                                                            <AvatarFallback className="bg-primary/10 text-primary font-bold text-[9px]">
                                                                {selectedRecipient.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm font-semibold text-primary flex-1 truncate">{selectedRecipient.name}</span>
                                                        <button onClick={clearRecipient} className="text-muted-foreground hover:text-primary transition-colors shrink-0">
                                                            <X size={14} />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Search size={14} className="text-muted-foreground shrink-0" />
                                                        <input
                                                            value={searchQuery}
                                                            onChange={(e) => setSearchQuery(e.target.value)}
                                                            placeholder="Search by name or @handle"
                                                            className="flex-1 bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground min-w-0"
                                                        />
                                                    </>
                                                )}
                                            </div>

                                            {searchResults.length > 0 && (
                                                <div className="absolute z-30 left-0 right-0 top-full mt-1 rounded-xl border border-border bg-background shadow-lg">
                                                    {searchResults.map((user) => (
                                                        <button
                                                            key={user.id}
                                                            type="button"
                                                            // onMouseDown prevents the input losing focus before onClick fires
                                                            onMouseDown={(e) => e.preventDefault()}
                                                            onClick={() => selectRecipient(user)}
                                                            className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-accent/40 transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
                                                        >
                                                            <Avatar className="size-7 shrink-0">
                                                                <AvatarImage src={user.image ?? ""} alt={user.name} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <div className="flex items-center gap-1">
                                                                    <span className="text-sm font-semibold text-primary truncate">{user.name}</span>
                                                                    {user.verified && (
                                                                        <BadgeCheck size={13} className="text-primary shrink-0" fill="currentColor" stroke="var(--lynt)" />
                                                                    )}
                                                                </div>
                                                                <span className="text-xs text-muted-foreground">@{user.handle}</span>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Message */}
                                    <div>
                                        <label className="text-xs font-semibold text-primary mb-1 block">Message</label>
                                        <textarea
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Write something kind..."
                                            rows={4}
                                            maxLength={280}
                                            className="w-full rounded-lg border border-border bg-background/70 px-3 py-2.5 text-sm text-primary outline-none placeholder:text-muted-foreground resize-none focus:border-amber-400/60 transition-colors"
                                        />
                                        <div className={`text-right text-[10px] font-semibold mt-0.5 ${charsLeft < 20 ? (charsLeft < 0 ? "text-red-500" : "text-amber-500") : "text-muted-foreground"}`}>
                                            {charsLeft}
                                        </div>
                                    </div>

                                    {sendError && (
                                        <p className="text-xs font-semibold text-red-500">{sendError}</p>
                                    )}

                                    {sendSuccess && (
                                        <div className="rounded-lg bg-amber-400/15 border border-amber-400/30 px-3 py-2.5 flex items-center gap-2">
                                            <Heart size={14} className="text-amber-500 shrink-0" fill="currentColor" />
                                            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Fuzzy sent! You just made someone&apos;s day 💛</p>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => void handleSend()}
                                        disabled={!selectedRecipient || !message.trim() || message.length > 280 || sending}
                                        className="w-full rounded-lg bg-amber-400 hover:bg-amber-500 text-amber-950 font-bold text-sm py-2.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Send size={15} />
                                        {sending ? "Sending..." : "Send Fuzzy"}
                                    </button>

                                    <p className="text-[10px] text-muted-foreground text-center">
                                        Be kind. Abuse can be reported and is reviewed by our team.
                                    </p>
                                </div>
                            </div>

                            {/* Info card */}
                            <div className="mt-4 rounded-xl border border-border bg-[var(--lynt)] p-4">
                                <h3 className="text-sm font-bold text-primary mb-2 flex items-center gap-1.5">
                                    What are Warm Fuzzies?
                                </h3>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Warm Fuzzies are anonymous kind notes you can send to anyone on Quacky. They go straight into that person&apos;s bag — only they can read them, and they&apos;ll never know who sent it.
                                </p>
                                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                                    Use them to spread positivity, cheer someone up, or let someone know you appreciate them.
                                </p>
                            </div>
                        </div>

                        <ReportAbuse
                            key={reportingId ?? "report-fuzzy"}
                            isOpen={reportingId !== null}
                            onClose={() => setReportingId(null)}
                            onSubmit={(type, reason) => reportingId ? handleReport(reportingId, type, reason) : Promise.resolve()}
                            title="Report this Warm Fuzzy"
                            description="Tell us why you're reporting this fuzzy. Our team will review it."
                            submitLabel="Submit report"
                            successTitle="Report filed"
                            successDescription="Thanks for keeping our community safe."
                            reasons={REPORT_REASONS}
                            defaultType="harassment"
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}

// ── Fuzzy Card ──
interface FuzzyCardProps {
    fuzzy: WarmFuzzy;
    onStartReport: () => void;
}

function FuzzyCard({
    fuzzy,
    onStartReport,
}: FuzzyCardProps) {
    return (
        <div className="px-5 py-4">
            <div className="rounded-xl bg-amber-400/10 border border-amber-400/25 px-4 py-3.5 relative">
                <Heart size={13} className="text-amber-400 absolute top-3 right-3" fill="currentColor" />
                <p className="text-sm text-primary leading-relaxed whitespace-pre-line pr-4">{fuzzy.message}</p>
            </div>

            {/* Timestamp + report trigger — always a simple flat row */}
            <div className="flex items-center justify-between mt-2 px-1">
                <span className="text-[10px] text-muted-foreground">{formatTimestamp(fuzzy.createdAt)}</span>
                <button
                    onClick={onStartReport}
                    className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-red-500 transition-colors"
                >
                    Report
                </button>
            </div>
        </div>
    );
}
