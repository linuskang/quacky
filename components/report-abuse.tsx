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

// Libraries
import axios from "axios";
import { toast } from "sonner"

// Components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogFooter,
    DialogClose
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { PrimaryTitle } from "./text";

// Types
type ReportAbuse = {
    url: string
    open: boolean
    onOpen: (open: boolean) => void
}

export function ReportAbuse({
    url,
    open,
    onOpen
}: ReportAbuse) {
    const [pending, setPending] = useState(false)
    const [reason, setReason] = useState("")

    async function report() {
        setPending(true)
        try {
            await axios.post(url, {
                reason: reason.trim(),
            })

            toast.success("Reported content. Thanks for keeping our community safe.");
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setPending(false)
            onOpen(false)
            setReason("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpen}>
            <DialogContent showCloseButton={false} className="!max-w-lg">
                <DialogHeader>
                    <PrimaryTitle className="mb-2">
                        Report Abuse
                    </PrimaryTitle>
                    <DialogDescription>
                        Tell us why this content should be removed. Please keep it brief and on point.
                    </DialogDescription>
                </DialogHeader>

                <Textarea
                    placeholder="Enter your reason for reporting..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                />

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            variant="secondary"
                            className="h-8 px-3 text-sm rounded-full"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        disabled={!reason.trim() || pending}
                        variant="primary"
                        onClick={report}
                        className="h-8 rounded-full px-4 text-sm"
                    >
                        {pending ? "Reporting..." : "Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}