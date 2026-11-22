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

"use client"

import { useState } from "react"
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Flag } from "lucide-react"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

type Props = {
    offenderHandle: string
}

export function ReportUser({ offenderHandle }: Props) {
    const [reportReason, setReportReason] = useState("")
    const [open, setOpen] = useState(false)
    const utils = trpc.useUtils()

    const reportMutation = trpc.users.report.useMutation({
        onSuccess: async () => {
            toast.success(
                "Report submitted. Thank you for helping us keep the community safe."
            )
            setOpen(false)
            setReportReason("")
            await Promise.all([
                utils.users.byHandle.invalidate({ handle: offenderHandle }),
                utils.me.get.invalidate(),
            ])
        },
        onError: () => {
            toast.error("uh oh, something went wrong. Please try again later.")
        },
    })

    const reportPending = reportMutation.isPending

    function reportabuse() {
        reportMutation.mutate({
            handle: offenderHandle,
            reason: reportReason,
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-1 font-semibold hover:underline">
                    <Flag className="h-4 w-4" strokeWidth={3} />
                    Report
                </button>
            </DialogTrigger>

            <DialogContent className="w-full !max-w-lg border-2 border-border bg-card-primary">
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-primary">
                        Report user
                    </DialogTitle>
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
                            className="h-8 rounded-full border-2 border-border bg-card-primary px-3 text-base hover:border-primary"
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
