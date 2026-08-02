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

import axios from "axios"
import { toast } from "sonner"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Flag, BadgeCheck, ArrowLeft } from "lucide-react"

import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import { SearchBar } from "@/components/search-bar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogClose,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import Loading from "@/components/loading"
import { useTimeAgo, useFormattedDate } from "@/client/utils"

interface Short {
    id: string
    description: string | null
    url: string
    flagged: boolean
    createdAt: string
    user: {
        id: string
        username: string
        name: string
        image: string
    }
}

export default function Page() {
    const params = useParams()
    const id = params.id as string

    const [short, setShort] = useState<Short>()
    const [load, setLoad] = useState(false)

    const timeAgo = useTimeAgo(short?.createdAt ?? "")
    const postedAt = useFormattedDate(short?.createdAt ?? "")

    const [reportOpen, setReportOpen] = useState(false)
    const [reportReason, setReportReason] = useState("")
    const [reportPending, setReportPending] = useState(false)

    useEffect(() => {
        async function fetchShort() {
            setLoad(true)
            try {
                const res = await axios.get(`/api/shorts/${id}`)
                setShort(res.data)
            } catch {
                toast.error("Short not found")
            } finally {
                setLoad(false)
            }
        }
        fetchShort()
    }, [id])

    async function reportShort() {
        setReportPending(true)
        try {
            await axios.post(`/api/shorts/${id}/report`, {
                reason: reportReason,
            })
            toast.success(
                "Report submitted. Thank you for helping us keep the community safe."
            )
            setReportOpen(false)
            setReportReason("")
        } catch {
            toast.error("Something went wrong. Please try again later.")
        } finally {
            setReportPending(false)
        }
    }

    return (
        <PageLayout>
            <PageCenter>
                {load && <Loading />}
                {short && (
                    <>
                        <Link
                            href="/shorts"
                            className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to shorts
                        </Link>

                        <Card className="mx-auto w-full max-w-xl overflow-hidden">
                            <video
                                src={short.url}
                                controls
                                className="w-full"
                                playsInline
                            />
                            <CardContent className="mt-3">
                                {short.description && (
                                    <p className="mb-3 text-base whitespace-pre-wrap">
                                        {short.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between">
                                    <Link
                                        href={`/@${short.user.username}`}
                                        className="flex items-center gap-2 hover:underline"
                                    >
                                        <Image
                                            src={short.user.image}
                                            alt={short.user.name}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                        <div className="flex flex-col">
                                            <span className="flex items-center gap-1 text-sm font-bold">
                                                {short.user.name}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                @{short.user.username}
                                            </span>
                                        </div>
                                    </Link>

                                    <div className="flex items-center gap-2">
                                        {timeAgo && (
                                            <span
                                                className="text-xs text-muted-foreground"
                                                title={postedAt ?? undefined}
                                            >
                                                {timeAgo}
                                            </span>
                                        )}
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-7 gap-1 rounded-full border-2 border-border bg-card-primary px-3 text-xs font-semibold hover:border-primary"
                                            onClick={() => setReportOpen(true)}
                                        >
                                            <Flag className="h-3 w-3" />
                                            Report
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Dialog open={reportOpen} onOpenChange={setReportOpen}>
                            <DialogContent className="w-full !max-w-lg border-2 border-border bg-card-primary">
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-bold text-primary">
                                        Report short
                                    </DialogTitle>
                                    <DialogDescription>
                                        Tell us why this short should be
                                        reviewed.
                                    </DialogDescription>
                                </DialogHeader>
                                <Textarea
                                    placeholder="Reason for reporting this short"
                                    className="w-full border-2 border-border !ring-0"
                                    value={reportReason}
                                    onChange={(e) =>
                                        setReportReason(e.target.value)
                                    }
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
                                        disabled={
                                            !reportReason.trim() ||
                                            reportPending
                                        }
                                        onClick={reportShort}
                                        className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                                    >
                                        {reportPending
                                            ? "Reporting..."
                                            : "Report"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    )
}
