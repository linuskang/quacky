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
import Image from "next/image";
import Link from "next/link";
import { useTimeAgo } from "@/client/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import axios from "axios";

// Components
import {
    BadgeCheck,
    SendHorizontal,
    MoreHorizontal
} from "lucide-react";
import { Admin } from "./icons";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import { CharCounter } from "@/components/character-counter";
import { ReportAbuse } from "@/components/report-abuse";
import { PurpleEyeWarning } from "./warning-cards";
import { authClient } from "@/client/auth";
import {
    MentionSuggestions,
    useMentionSuggestions
} from "@/components/mention-suggestions";
import { Markdown } from "@/components/markdown-renderer";

// Types
import { Comment } from "@/types";
import { Card } from "./ui/card";

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
        await axios.post(`/api/posts/${postId}/comment`, {
            content
        });

        setContent("");
        toast.success("Comment created!");
    }

    return (
        <div className="relative">
            <InputGroup className="h-10">
                <InputGroupInput
                    ref={inputRef}
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

export function CommentCard({ comment }: { comment: Comment }) {
    const router = useRouter();
    const [reportOpen, setReportOpen] = useState(false);
    const [delPending, setDelPending] = useState(false);
    const { data: session } = authClient.useSession();
    const timeAgo = useTimeAgo(comment.createdAt);
    const canDelete = session && (session.user.username === comment.author.username || session.user.role === "admin");

    async function delComment() {
        setDelPending(true);
        try {
            await axios.delete(`/api/comments/${comment.id}`);

            toast.success("Comment deleted.");
            router.refresh();
        } catch {
            toast.error("Something went wrong.");
        } finally {
            setDelPending(false);
        }
    }

    return (
        <Card
            onClick={() => router.push(`/comment/${comment.id}`)}
            className="hover:border-primary transition cursor-pointer max-w-lg !bg-card-primary p-3 flex flex-col gap-2"
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
                                            onSelect={delComment}
                                            disabled={delPending}
                                            className="text-sm font-medium text-destructive cursor-pointer rounded-sm data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                                        >
                                            {delPending ? "Deleting..." : "Delete"}
                                        </DropdownMenuItem>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </span>

                        <ReportAbuse
                            url={`/api/comments/${comment.id}/report`}
                            open={reportOpen}
                            onOpen={setReportOpen}
                        />
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
        </Card>
    )
}
