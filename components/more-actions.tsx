"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { authClient } from "@/client/auth";
import { Post } from "@/types";
import { CharCounter } from "@/components/char-counter";
import { useRouter } from "next/navigation";

export function MoreActions({ post }: { post: Post }) {

    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportPending, setReportPending] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [editPending, setEditPending] = useState(false);
    const [deletePending, setDeletePending] = useState(false);
    const { data: session } = authClient.useSession();
    const router = useRouter();

    if (!session) return null;

    const isOwner = session.user.username === post.author.username;
    const canDelete = isOwner || session.user.role === "admin";

    const reportPost = async () => {
        if (!reportReason.trim() || reportPending) return;

        setReportPending(true);

        const res = await fetch(`/api/posts/${post.id}/report`, {
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

    const editPost = async () => {
        const content = editContent.trim();

        if (!content || content.length > 400 || editPending) return;

        setEditPending(true);

        const res = await fetch(`/api/posts/${post.id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                content,
            }),
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null) as { err?: string } | null;
            toast.error(data?.err ?? res.statusText);
            setEditPending(false);
            return;
        }

        setEditOpen(false);
        setEditPending(false);
        toast.success("Post updated.");
        window.location.reload();
    }

    const deletePost = async () => {
        if (!canDelete || deletePending) return;

        setDeletePending(true);

        const res = await fetch(`/api/posts/${post.id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            const data = await res.json().catch(() => null) as { err?: string } | null;
            toast.error(data?.err ?? res.statusText);
            setDeletePending(false);
            return;
        }

        toast.success("Post deleted.");
        router.push("/");
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
                        {isOwner && (
                            <DropdownMenuItem
                                onSelect={() => {
                                    setEditContent(post.content);
                                    setEditOpen(true);
                                }}
                                className="text-sm font-medium text-primary cursor-pointer rounded-sm data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                            >
                                Edit
                            </DropdownMenuItem>
                        )}
                        {canDelete && (
                            <DropdownMenuItem
                                onSelect={deletePost}
                                disabled={deletePending}
                                className="text-sm font-medium text-destructive cursor-pointer rounded-sm data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                            >
                                {deletePending ? "Deleting..." : "Delete"}
                            </DropdownMenuItem>
                        )}
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
            {isOwner && (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="bg-card-primary border-2 border-border w-full !max-w-lg">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-primary">Edit post</DialogTitle>
                            <DialogDescription>
                                Update your post content.
                            </DialogDescription>
                        </DialogHeader>
                        <Textarea
                            placeholder="What's happening?"
                            className="min-h-32 w-full border-2 border-border !ring-0"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                        />
                        <div className="flex items-center justify-between gap-2">
                            <CharCounter length={editContent.length} />
                            <div className="flex items-center gap-2">
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
                                    disabled={!editContent.trim() || editContent.length > 400 || editPending}
                                    onClick={editPost}
                                    className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                                >
                                    {editPending ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </span>
    )
}
