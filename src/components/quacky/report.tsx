// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useState } from "react";

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
interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (type: string, reason: string) => void;
}

export function ReportAbuse(
    {
        isOpen,
        onClose,
        onSubmit
    }: Props
) {
    // states
    const [reportType, setReportType] = useState("");
    const [reportReason, setReportReason] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);

    // submit to function
    function submit() {
        onSubmit(reportType, reportReason);
        setIsSuccess(true);
    }

    // reset everything
    function close() {
        setReportType("");
        setReportReason("");
        setIsSuccess(false);
        onClose();
    }

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Report Abuse</DialogTitle>
                    <DialogDescription>
                        Tell us why you're reporting this. Our team will review your report and take appropriate action.
                    </DialogDescription>
                </DialogHeader>

                {isSuccess === false ? (

                    <div className="space-y-2">
                        <RadioGroup value={reportType} onValueChange={setReportType}>
                            <div className="flex items-center gap-2 p-2">
                                <RadioGroupItem value="spam" id="spam" />
                                <label htmlFor="spam" className="cursor-pointer font-medium">Spam</label>
                            </div>

                            <div className="flex items-center gap-2 p-2">
                                <RadioGroupItem value="harassment" id="harassment" />
                                <label htmlFor="harassment" className="cursor-pointer font-medium">Harassment</label>
                            </div>

                            <div className="flex items-center gap-2 p-2">
                                <RadioGroupItem value="self-harm" id="self-harm" />
                                <label htmlFor="self-harm" className="cursor-pointer font-medium">Self-Harm Content</label>
                            </div>

                            <div className="flex items-center gap-2 p-2">
                                <RadioGroupItem value="impersonation" id="impersonation" />
                                <label htmlFor="impersonation" className="cursor-pointer font-medium">Impersonation</label>
                            </div>

                            <div className="flex items-center gap-2 p-2">
                                <RadioGroupItem value="illegal" id="illegal" />
                                <label htmlFor="illegal" className="cursor-pointer font-medium">Illegal Activity</label>
                            </div>

                            <div className="flex items-center gap-2 p-2">
                                <RadioGroupItem value="scam" id="scam" />
                                <label htmlFor="scam" className="cursor-pointer font-medium">Scam or Fraud</label>
                            </div>

                            <div className="flex items-center gap-2 p-2">
                                <RadioGroupItem value="other" id="other" />
                                <label htmlFor="other" className="cursor-pointer font-medium">Other (specify below)</label>
                            </div>

                        </RadioGroup>

                        <Textarea
                            placeholder="Tell us more (optional)"
                            value={reportReason}
                            onChange={(e) => setReportReason(e.target.value)}
                        />

                        <DialogFooter>
                            <Button variant="outline" className="cursor-pointer" onClick={close}>Cancel</Button>
                            <Button
                                onClick={submit}
                                disabled={!reportType}
                                className="cursor-pointer"
                            >
                                Submit
                            </Button>
                        </DialogFooter>

                    </div>
                ) : (
                    <div className="text-center py-4">
                        <p className="font-bold text-lg">Report filed</p>
                        <p className="text-sm text-muted-foreground mb-4">Thanks for keeping our community safe.</p>
                        <Button onClick={close} className="cursor-pointer">
                            Close
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
