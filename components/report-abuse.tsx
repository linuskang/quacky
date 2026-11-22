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

// Libraries
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"

// Components
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { PrimaryTitle } from "./text"

// Types
export type ReportTarget =
    | { type: "post"; id: string }
    | { type: "comment"; id: string }
    | { type: "meme"; id: string }
    | { type: "short"; id: string }
    | { type: "fuzzy"; id: string }
    | { type: "user"; handle: string }

type ReportAbuseProps = {
    target: ReportTarget | null
    open: boolean
    onOpen: (open: boolean) => void
}

export function ReportAbuse({ target, open, onOpen }: ReportAbuseProps) {
    const router = useRouter()
    const [reason, setReason] = useState("")
    const utils = trpc.useUtils()

    const reportPost = trpc.posts.report.useMutation()
    const reportComment = trpc.comments.report.useMutation()
    const reportMeme = trpc.memes.report.useMutation()
    const reportShort = trpc.shorts.report.useMutation()
    const reportFuzzy = trpc.fuzzies.report.useMutation()
    const reportUser = trpc.users.report.useMutation()

    const pending =
        reportPost.isPending ||
        reportComment.isPending ||
        reportMeme.isPending ||
        reportShort.isPending ||
        reportFuzzy.isPending ||
        reportUser.isPending

    async function report() {
        if (!target) return

        const trimmed = reason.trim()
        try {
            switch (target.type) {
                case "post":
                    await reportPost.mutateAsync({
                        id: target.id,
                        reason: trimmed,
                    })
                    await Promise.all([
                        utils.posts.feed.invalidate(),
                        utils.posts.byUser.invalidate(),
                        utils.posts.byId.invalidate({ id: target.id }),
                        utils.me.get.invalidate(),
                    ])
                    break
                case "comment":
                    await reportComment.mutateAsync({
                        id: target.id,
                        reason: trimmed,
                    })
                    await Promise.all([
                        utils.comments.byId.invalidate(),
                        utils.posts.byId.invalidate(),
                        utils.me.get.invalidate(),
                    ])
                    router.refresh()
                    break
                case "meme":
                    await reportMeme.mutateAsync({
                        id: target.id,
                        reason: trimmed,
                    })
                    await Promise.all([
                        utils.memes.list.invalidate(),
                        utils.memes.byId.invalidate({ id: target.id }),
                    ])
                    break
                case "short":
                    await reportShort.mutateAsync({
                        id: target.id,
                        reason: trimmed,
                    })
                    await Promise.all([
                        utils.shorts.list.invalidate(),
                        utils.shorts.byId.invalidate({ id: target.id }),
                    ])
                    break
                case "fuzzy":
                    await reportFuzzy.mutateAsync({
                        id: target.id,
                        reason: trimmed,
                    })
                    await utils.fuzzies.list.invalidate()
                    break
                case "user":
                    await reportUser.mutateAsync({
                        handle: target.handle,
                        reason: trimmed,
                    })
                    await utils.users.byHandle.invalidate({
                        handle: target.handle,
                    })
                    break
            }

            toast.success(
                "Reported content. Thanks for keeping our community safe."
            )
        } catch {
            toast.error("Something went wrong.")
        } finally {
            onOpen(false)
            setReason("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpen}>
            <DialogContent showCloseButton={false} className="!max-w-lg">
                <DialogHeader>
                    <PrimaryTitle className="mb-2">Report Abuse</PrimaryTitle>
                    <DialogDescription>
                        Tell us why this content should be removed. Please keep
                        it brief and on point.
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
                            className="h-8 rounded-full px-3 text-sm"
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        disabled={!reason.trim() || pending || !target}
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
