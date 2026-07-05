"use client";
import { Comment } from "@/types";
import { BadgeCheck, SendHorizontal, MoreHorizontal } from "lucide-react";
import Image from "next/image";
import { Admin } from "./icons";
import { useTimeAgo } from "@/client/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { CharCounter } from "./char-counter";
import { useRef, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogHeader, DialogClose, DialogDescription } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { PurpleEyeWarning } from "./warning";
import { authClient } from "@/client/auth";
import { MentionSuggestions, useMentionSuggestions } from "@/components/mention-suggestions";
import { Markdown } from "@/components/md";

export function CommentList(
    {
        comments,
        postId
    }: {
        comments: Comment[];
        postId: string;
    }
) {
    return (
        <div className="flex flex-col gap-2">
            <Reply
                postId={postId}
            />
            <h1 className="text-lg font-semibold mt-2">Comments</h1>
            {comments.length == 0 ? (
                <>
                    <Image
                        src="/balloon.png"
                        alt="No comments"
                        width={400}
                        height={400}
                        className="mx-auto mt-4"
                    />
                    <p className="text-sm text-center text-muted-foreground">
                        No comments yet. Be the first to comment!
                    </p>
                </>
            ) : (
                comments.map((comment) => (
                    <CommentCard
                        key={comment.id}
                        comment={comment}
                    />
                ))
            )}
        </div>
    )
}

export function Reply(
    {
        postId,
    }: {
        postId: string;
    }
) {
    const [content, setContent] = useState("");
    const [caret, setCaret] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
    const mentions = useMentionSuggestions({
        value: content,
        caret,
        onChange: setContent,
        onCaretChange: (nextCaret) => {
            setCaret(nextCaret);
            requestAnimationFrame(() => {
                inputRef.current?.focus();
                inputRef.current?.setSelectionRange(nextCaret, nextCaret);
            });
        },
    });

    async function comment() {
        const res = await fetch(`/api/posts/${postId}/comment`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    content
                }
            )
        });

        if (!res.ok) {
            toast.error(res.statusText);
            return;
        }

        setContent("");
        toast.success("Comment created!");
    }

    return (
        <div className="relative">
            <InputGroup className="!bg-card border-2 border-border h-10 !ring-0 focus-within:!border-chart-3">
                <InputGroupInput
                    ref={inputRef}
                    className="!text-sm !font-semibold"
                    placeholder="Write a reply..."
                    value={content}
                    onChange={(e) => {
                        setContent(e.target.value);
                        setCaret(e.target.selectionStart ?? 0);
                    }}
                    onClick={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
                    onKeyUp={(e) => setCaret(e.currentTarget.selectionStart ?? 0)}
                />
                <InputGroupAddon align="inline-end">
                    <CharCounter
                        length={content.length}
                        maxLength={100}
                        width={8}
                        height={8}
                    />
                    <InputGroupButton
                        variant="ghost"
                        className="hover:!bg-transparent"
                        onClick={comment}
                        disabled={content.trim().length == 0 || content.length > 100}
                    >
                        <SendHorizontal className="!size-5 text-foreground" />
                    </InputGroupButton>
                </InputGroupAddon>
            </InputGroup>
            <MentionSuggestions
                open={mentions.open}
                users={mentions.users}
                onSelect={mentions.selectUser}
            />
        </div>
    )
}

export function CommentCard(
    {
        comment,
    }: {
        comment: Comment;
    }
) {
    const router = useRouter();
    const [reportOpen, setReportOpen] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportPending, setReportPending] = useState(false);
    const [deletePending, setDeletePending] = useState(false);
    const { data: session } = authClient.useSession();
    const timeAgo = useTimeAgo(comment.createdAt);
    const canDelete = session && (session.user.username === comment.author.username || session.user.role === "admin");

    const reportComment = async () => {
        if (!reportReason.trim() || reportPending) return;

        setReportPending(true);

        const res = await fetch(`/api/comments/${comment.id}/report`, {
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
            toast.success("Reported comment. Thanks for keeping our community safe.");
        }
    }

    const deleteComment = async () => {
        if (!canDelete || deletePending) return;

        setDeletePending(true);

        const res = await fetch(`/api/comments/${comment.id}`, {
            method: "DELETE",
        });

        if (!res.ok) {
            toast.error(res.statusText);
            setDeletePending(false);
            return;
        }

        toast.success("Comment deleted.");
        window.location.assign(`/post/${comment.postId}`);
    }

    return (
        <div
            onClick={() => router.push(`/comment/${comment.id}`)}
            className="rounded-md hover:border-primary/80 transition cursor-pointer border-2 border-border max-w-lg !bg-card-primary p-3 flex flex-col gap-2"
        >
            <div className="flex gap-3">
                <div className="shrink-0">
                    <Image
                        src={comment.author.image}
                        alt={comment.author.name}
                        width={28}
                        height={28}
                        unoptimized
                        className="rounded-full"
                    />
                </div>
                <div className="flex flex-col gap-2 min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-base -mt-1 font-semibold flex-wrap">
                        <Link
                            href={`/@${comment.author.username}`}
                            onClick={(event) => event.stopPropagation()}
                            className="text-primary text-sm font-semibold hover:underline"
                        >
                            {comment.author.name}
                        </Link>

                        {comment.author.verified && (
                            <BadgeCheck
                                className="h-[20px] w-[20px] fill-primary text-background"
                            />
                        )}

                        {comment.author.role == "admin" && (
                            <Admin />
                        )}

                        <Link
                            href={`/@${comment.author.username}`}
                            onClick={(event) => event.stopPropagation()}
                            className="text-sm text-muted-foreground font-semibold hover:underline"
                        >
                            @{comment.author.username}
                        </Link>

                        {timeAgo && (
                            <span className="text-sm text-muted-foreground">
                                · {timeAgo}
                            </span>
                        )}

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
                                        {canDelete && (
                                            <DropdownMenuItem
                                                onSelect={deleteComment}
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
                                        <DialogTitle className="text-lg font-bold text-primary">Report comment</DialogTitle>
                                        <DialogDescription>
                                            Tell us why this comment should be reviewed.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <Textarea
                                        placeholder="Reason for reporting this comment"
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
                                            onClick={reportComment}
                                            className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                                        >
                                            {reportPending ? "Reporting..." : "Report"}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </span>
                    </div>
                    {comment.flagged && (
                        <PurpleEyeWarning
                            text="This comment has been unlisted by a moderator due to a violation of our community guidelines."
                        />
                    )}
                    <div className="text-sm text-muted-foreground break-words mb-1">
                        <Markdown>{comment.content}</Markdown>
                    </div>
                </div>
            </div>
        </div>
    )
}
