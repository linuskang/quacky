// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useEffect, useState } from "react";

// UI Components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

// Types
interface ReportReasonOption {
    value: string;
    label: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: string, reason: string) => void | Promise<void>;
    title?: string;
    description?: string;
    submitLabel?: string;
    successTitle?: string;
    successDescription?: string;
    reasons?: ReadonlyArray<ReportReasonOption>;
    defaultType?: string;
}

const DEFAULT_REASONS: ReportReasonOption[] = [
    { value: "spam", label: "Spam" },
    { value: "harassment", label: "Harassment" },
    { value: "self-harm", label: "Self-Harm Content" },
    { value: "impersonation", label: "Impersonation" },
    { value: "illegal", label: "Illegal Activity" },
    { value: "scam", label: "Scam or Fraud" },
    { value: "other", label: "Other (specify below)" },
];

export function ReportAbuse(
    {
        isOpen,
        onClose,
        onSubmit,
        title = "Report Abuse",
        description = "Tell us why you're reporting this. Our team will review your report and take appropriate action.",
        submitLabel = "Submit",
        successTitle = "Report filed",
        successDescription = "Thanks for keeping our community safe.",
        reasons = DEFAULT_REASONS,
        defaultType,
    }: Props
) {
    // states
    const [reportType, setReportType] = useState(defaultType ?? reasons[0]?.value ?? "");
    const [reportReason, setReportReason] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        setReportType(defaultType ?? reasons[0]?.value ?? "");
        setReportReason("");
        setIsSuccess(false);
        setIsSubmitting(false);
        setError(null);
    }, [defaultType, isOpen, reasons]);

    // submit to function
    async function submit() {
        if (!reportType || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await Promise.resolve(onSubmit(reportType, reportReason));
            setIsSuccess(true);
        } catch (submitError) {
            setError(submitError instanceof Error ? submitError.message : "Could not submit report.");
        } finally {
            setIsSubmitting(false);
        }
    }

    // reset everything
    function close() {
        setReportType(defaultType ?? reasons[0]?.value ?? "");
        setReportReason("");
        setIsSuccess(false);
        setIsSubmitting(false);
        setError(null);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) close(); }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>

                {isSuccess === false ? (

                    <div className="space-y-2">
                        <RadioGroup value={reportType} onValueChange={setReportType}>
                            {reasons.map((reason) => (
                                <div key={reason.value} className="flex items-center gap-2 p-2">
                                    <RadioGroupItem value={reason.value} id={reason.value} />
                                    <label htmlFor={reason.value} className="cursor-pointer font-medium">{reason.label}</label>
                                </div>
                            ))}
                        </RadioGroup>

                        <Textarea
                            placeholder="Tell us more (optional)"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />

                        {error && (
                            <p className="text-sm text-red-500">{error}</p>
                        )}

                        <DialogFooter>
                            <Button variant="outline" className="cursor-pointer" onClick={close} disabled={isSubmitting}>Cancel</Button>
                            <Button
                                onClick={submit}
                                disabled={!reportType || isSubmitting}
                                className="cursor-pointer"
                            >
                                {isSubmitting ? "Submitting..." : submitLabel}
                            </Button>
                        </DialogFooter>

                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="font-bold text-lg">{successTitle}</p>
                        <p className="text-sm text-muted-foreground mb-4">{successDescription}</p>
                        <Button onClick={close} className="cursor-pointer">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
