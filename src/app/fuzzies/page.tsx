"use client";

import { Suspense, useEffect, useState } from "react";
import { authClient } from "@/client/auth";
import { formatTimestamp } from "@/client/utils";
import Sidebar from "@/components/quacky/sidebar";
import Login from "@/components/login";
import Loading from "@/components/loading";
import { ReportAbuse } from "@/components/quacky/report";
import { FuzzyBag } from "@/components/quacky/fuzzy-bag";
import type { WarmFuzzy } from "@/types";

// ─── Card theme ───────────────────────────────────────────────────────────────
const CARD = { bg: "#FFFBEC", border: "#F0C060", accent: "#E8A020", line: "#F5D080" };

const FONT = "'Comic Sans MS','Chalkboard SE','Comic Neue',cursive";

const REPORT_REASONS = [
    { value: "harassment",   label: "Harassment or bullying" },
    { value: "inappropriate", label: "Inappropriate content" },
    { value: "spam",         label: "Spam" },
    { value: "other",        label: "Other" },
] as const;

// ─── Card ─────────────────────────────────────────────────────────────────────
function FuzzyCard({ fuzzy, index, onReport }: { fuzzy: WarmFuzzy; index: number; onReport: () => void }) {
    return (
        <div
            className="relative group rounded-2xl px-5 pt-5 pb-4"
            style={{
                background: CARD.bg,
                border: `2.5px solid ${CARD.border}`,
                boxShadow: `4px 5px 0 #3D200825`,
                fontFamily: FONT,
                animation: `fuzzyPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${index * 80}ms both`,
            }}
        >
            <div className="flex justify-center mb-3">
                <span style={{ fontSize: 22, color: CARD.accent }}>♥</span>
            </div>
            <p className="text-center leading-relaxed whitespace-pre-line" style={{ color: "#3D2008", fontSize: 13.5 }}>
                {fuzzy.message}
            </p>
            <div className="my-3" style={{ borderTop: `1.5px dashed ${CARD.line}` }} />
            <p className="text-center font-bold" style={{ color: CARD.accent, fontSize: 11 }}>
                — from a secret admirer 💛
            </p>
            <p className="text-center mt-1" style={{ color: "#9B7040", fontSize: 10 }}>
                {formatTimestamp(fuzzy.createdAt)}
            </p>
            <button
                onClick={onReport}
                className="absolute bottom-2.5 right-3 text-[9px] opacity-0 group-hover:opacity-60 hover:!opacity-100 transition-opacity"
                style={{ color: "#9B7040" }}
            >
                report
            </button>
        </div>
    );
}

// ─── Send form ────────────────────────────────────────────────────────────────
function SendForm({ onSent }: { onSent: () => void }) {
    const [handle,  setHandle]  = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error,   setError]   = useState<string | null>(null);

    async function send() {
        if (!handle.trim() || !message.trim() || sending) return;
        setSending(true); setError(null);
        try {
            const res  = await fetch("/api/v1/fuzzies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipientHandle: handle.trim(), message: message.trim() }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) throw new Error(data?.error || "Send failed");
            setHandle(""); setMessage(""); setSuccess(true); onSent();
            setTimeout(() => setSuccess(false), 4000);
        } catch (e: any) {
            setError(e?.message || "Could not send");
        } finally {
            setSending(false);
        }
    }

    const charsLeft = 280 - message.length;

    return (
        <div className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "#FFFBEC", border: "2.5px solid #D4A040", fontFamily: FONT }}>
            <p className="font-bold text-sm" style={{ color: "#3D2008" }}>✉️ Send a Fuzzy</p>
            <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@their handle"
                className="w-full rounded-xl px-3 py-2 text-sm outline-none"
                style={{ background: "white", border: "2px solid #D4A040", color: "#3D2008", fontFamily: FONT }}
            />
            <div>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write something kind... ♥"
                    rows={4} maxLength={280}
                    className="w-full rounded-xl px-3 py-2 text-sm outline-none resize-none"
                    style={{ background: "white", border: "2px solid #D4A040", color: "#3D2008", fontFamily: FONT, lineHeight: 1.6 }}
                />
                <div className="text-right text-[10px] font-bold" style={{ color: charsLeft < 20 ? (charsLeft < 0 ? "#E03030" : "#D08020") : "#9B7040" }}>
                    {charsLeft}
                </div>
            </div>
            {error   && <p className="text-xs font-bold" style={{ color: "#E03030" }}>✗ {error}</p>}
            {success && <p className="text-xs font-bold" style={{ color: "#7A5000" }}>💛 Fuzzy sent!</p>}
            <button
                onClick={() => void send()}
                disabled={!handle.trim() || !message.trim() || message.length > 280 || sending}
                className="w-full rounded-xl py-2.5 font-bold text-sm transition-transform active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: "#F59E0B", color: "#3D2008", border: "2px solid #3D2008", boxShadow: "3px 3px 0 #3D2008", fontFamily: FONT }}
            >
                {sending ? "Sending..." : "Send Fuzzy ♥"}
            </button>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FuzziesPage() {
    return <Suspense fallback={<Loading />}><FuzziesPageContent /></Suspense>;
}

function FuzziesPageContent() {
    const { data: session, isPending } = authClient.useSession();
    const [fuzzies,     setFuzzies]     = useState<WarmFuzzy[]>([]);
    const [loading,     setLoading]     = useState(true);
    const [isOpen,      setIsOpen]      = useState(false);
    const [reportingId, setReportingId] = useState<string | null>(null);
    const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

    useEffect(() => { if (session) void load(); }, [session]);

    async function load() {
        try {
            setLoading(true);
            const res  = await fetch("/api/v1/fuzzies");
            const data = await res.json();
            if (data?.success) setFuzzies(data.fuzzies ?? []);
        } finally { setLoading(false); }
    }

    async function submitReport(id: string, _type: string, reason: string) {
        await fetch(`/api/v1/fuzzies/${id}/report`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ reason }),
        });
        setReportedIds((p) => new Set([...p, id]));
        setReportingId(null);
    }

    if (isPending) return <Loading />;
    if (!session)  return <Login />;

    const visible = fuzzies.filter((f) => !f.isReported && !reportedIds.has(f.id));

    return (
        <>
            <style>{`
                @keyframes fuzzyPop {
                    0%   { opacity:0; transform: translateY(-40px) scale(0.65); }
                    100% { opacity:1; transform: translateY(0)      scale(1);   }
                }
            `}</style>

            <main className="min-h-screen w-full flex flex-col items-center bg-background">
                <div className="flex w-full max-w-[1200px] flex-1 gap-4 px-4 pb-24 lg:pb-8">
                    <Sidebar session={session} />

                    <section className="flex-1 flex flex-col lg:flex-row gap-6 pt-8 w-full min-w-0 items-start">

                        {/* Bag + cards */}
                        <div className="flex-1 min-w-0 flex flex-col items-center gap-6 w-full">
                            <FuzzyBag
                                isOpen={isOpen}
                                count={visible.length}
                                loading={loading}
                                onClick={() => { if (!loading) setIsOpen((o) => !o); }}
                            />

                            {isOpen && (
                                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    {visible.length === 0 ? (
                                        <div
                                            className="col-span-full rounded-2xl p-8 text-center"
                                            style={{ background: "#FFFBEC", border: "2.5px dashed #D4A040", fontFamily: FONT, color: "#9B7040" }}
                                        >
                                            <p className="font-bold mb-1">Nothing here yet...</p>
                                            <p className="text-sm">Send someone a fuzzy and maybe they&apos;ll return the kindness! 💛</p>
                                        </div>
                                    ) : (
                                        visible.map((f, i) => (
                                            <FuzzyCard key={f.id} fuzzy={f} index={i} onReport={() => setReportingId(f.id)} />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Send form */}
                        <div className="w-full lg:w-80 shrink-0">
                            <SendForm onSent={load} />
                        </div>
                    </section>
                </div>
            </main>

            <ReportAbuse
                key={reportingId ?? "report"}
                isOpen={reportingId !== null}
                onClose={() => setReportingId(null)}
                onSubmit={(t, r) => reportingId ? submitReport(reportingId, t, r) : Promise.resolve()}
                title="Report this Warm Fuzzy"
                description="Tell us why you're reporting this fuzzy. Our team will review it."
                submitLabel="Submit report"
                successTitle="Report filed"
                successDescription="Thanks for keeping our community safe."
                reasons={REPORT_REASONS}
                defaultType="harassment"
            />
        </>
    );
}
