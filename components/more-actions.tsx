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
import axios from "axios"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { authClient } from "@/client/auth"

// Components
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogClose,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import { CharCounter } from "@/components/character-counter"
import { ReportAbuse } from "@/components/report-abuse"

// Types
import type { Post } from "@/types"

export function MoreActions({ post }: { post: Post }) {
    // states
    const [reportOpen, setReportOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [editContent, setEditContent] = useState(post.content)
    const [editPending, setEditPending] = useState(false)
    const [deletePending, setDeletePending] = useState(false)
    const { data: session } = authClient.useSession()
    const router = useRouter()

    if (!session) return null

    // states
    const isOwner = session.user.username == post.author.username
    const canDelete = isOwner || session.user.role == "admin"

    // utils functions
    async function editPost() {
        const content = editContent.trim()
        setEditPending(true)
        try {
            await axios.patch(`/api/posts/${post.id}`, {
                content,
            }).then(() => {
                setEditOpen(false)
                toast.success("Post updated.")
                window.location.reload()
            })
        } catch {
            toast.error("Something went wrong.")
        } finally {
            setEditPending(false)
        }
    }

    async function deletePost() {
        setDeletePending(true)
        try {
            await axios.delete(`/api/posts/${post.id}`)
            toast.success("Post deleted.")
            router.refresh()
        } catch {
            toast.error("Something went wrong.")
        } finally {
            setDeletePending(false)
        }
    }

    return (
        <div onClick={(e) => e.stopPropagation()}>
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
                    className="min-w-[140px] rounded-md border-2 border-border bg-background shadow-none"
                >
                    <DropdownMenuItem
                        onSelect={() => {
                            setReportOpen(true)
                        }}
                        className="cursor-pointer rounded-sm text-sm font-medium text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                    >
                        Report
                    </DropdownMenuItem>
                    {isOwner && !post.flagged && (
                        <DropdownMenuItem
                            onSelect={() => {
                                setEditContent(post.content)
                                setEditOpen(true)
                            }}
                            className="cursor-pointer rounded-sm text-sm font-medium text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                        >
                            Edit
                        </DropdownMenuItem>
                    )}
                    {canDelete && (
                        <DropdownMenuItem
                            onSelect={deletePost}
                            disabled={deletePending}
                            className="cursor-pointer rounded-sm text-sm font-medium text-destructive data-[highlighted]:bg-destructive/10 data-[highlighted]:text-destructive"
                        >
                            {deletePending ? "Deleting..." : "Delete"}
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
            {isOwner && !post.flagged && (
                <Dialog open={editOpen} onOpenChange={setEditOpen}>
                    <DialogContent className="w-full !max-w-lg border-2 border-border bg-card-primary">
                        <DialogHeader>
                            <DialogTitle className="text-lg font-bold text-primary">
                                Edit post
                            </DialogTitle>
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
                                        className="h-8 rounded-full border-2 border-border bg-card-primary px-3 text-base hover:border-primary"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    size="sm"
                                    disabled={
                                        !editContent.trim() ||
                                        editContent.length > 400 ||
                                        editPending
                                    }
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
            <ReportAbuse
                url={'/api/posts/' + post.id + '/report'}
                open={reportOpen}
                onOpen={setReportOpen}
            />
        </div>
    )
}
