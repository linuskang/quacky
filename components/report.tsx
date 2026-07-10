//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

"use client";

import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag } from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

type Props = {
    offenderHandle: string;
}

export function ReportUser({ offenderHandle }: Props) {
    const [reportReason, setReportReason] = useState("");
    const [reportPending, setReportPending] = useState(false);
    const [open, setOpen] = useState(false);

    async function reportabuse() {
        setReportPending(true);

        try {
            await axios.post(`/api/user/${offenderHandle}/report`, {
                reason: reportReason,
            });

            toast.success("Report submitted. Thank you for helping us keep the community safe.");
            setOpen(false);
            setReportReason("");
        } catch {
            toast.error("uh oh, something went wrong. Please try again later.");
        } finally {
            setReportPending(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center font-semibold gap-1 hover:underline">
                    <Flag className="h-4 w-4" strokeWidth={3} />
                    Report
                </button>
            </DialogTrigger>

            <DialogContent className="bg-card-primary border-2 border-border w-full !max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-primary">Report user</DialogTitle>
                    <DialogDescription>
                        Tell us why this user should be reviewed.
                    </DialogDescription>
                </DialogHeader>
                <Textarea
                    placeholder="Reason for reporting this user"
                    className="w-full border-2 border-border !ring-0"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                />
                <div className="flex items-center justify-end gap-2">
                    <DialogClose asChild>
                        <Button
                            variant="secondary"
                            className="bg-card-primary hover:border-primary h-8 px-3 border-2 border-border text-base rounded-full"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        size="sm"
                        disabled={!reportReason.trim() || reportPending}
                        onClick={reportabuse}
                        className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                    >
                        {reportPending ? "Reporting..." : "Report"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
