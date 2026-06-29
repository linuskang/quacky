"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

export function MoreActions({ postId }: { postId: string }) {

    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportPending, setReportPending] = useState(false);

    const reportPost = async () => {
        if (!reportReason.trim() || reportPending) return;

        setReportPending(true);

        const res = await fetch(`/api/posts/${postId}/report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                reason: reportReason.trim(),
            }),
        });

        if (!res.ok) {
            toast.error(res.statusText);
            setReportPending(false);
            return;
        } else {
            setReportReason("");
            setReportOpen(false);
            setReportPending(false);
            toast.success("Reported post. Thanks for keeping our community safe.");
        }
    }

    return (
        <span
            className="ml-auto shrink-0"
            onClick={(e) => e.stopPropagation()}
        >
            <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                        >
                            <MoreHorizontal size={16} />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        align="end"
                        className="bg-background border-2 border-border rounded-md shadow-none min-w-[140px]"
                    >
                        <DropdownMenuItem
                            onSelect={() => setReportOpen(true)}
                            className="text-sm font-medium text-primary cursor-pointer rounded-sm data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                        >
                            Report
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
                <DialogContent className="bg-card-primary border-2 border-border w-full !max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="text-lg font-bold text-primary">Report post</DialogTitle>
                        <DialogDescription>
                            Tell us why this post should be reviewed.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="Reason for reporting this post"
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
                            onClick={reportPost}
                            className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                        >
                            {reportPending ? "Reporting..." : "Report"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </span>
    )
}