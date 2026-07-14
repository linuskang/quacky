"use client"

// Libraries
import axios from "axios"
import { ChangeEvent, useEffect, useState } from "react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"

// Components
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Description, PrimaryTitle, Title } from "@/components/text"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ReportAbuse } from "@/components/report-abuse"
import { MoreHorizontal } from "lucide-react"

// Types
type Meme = {
    id: string
    imgUrl: string
    author: {
        id: string
        username: string
        image: string
        name: string
        verified: boolean
    }
    createdAt: string
    upvotes: number
    downvotes: number
    score: number
    me: "UPVOTE" | "DOWNVOTE" | null
}

export default function Page() {
    const [memes, setMemes] = useState<Meme[]>([])
    const [open, setOpen] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [previewUrl, setPreviewUrl] = useState("")
    const [loading, setLoading] = useState(true)
    const [posting, setPosting] = useState(false)
    const [voting, setVoting] = useState<string | null>(null)
    const [reportingMemeId, setReportingMemeId] = useState<string | null>(null)

    useEffect(() => {
        async function get() {
            try {
                const res = await axios.get("/api/memes")
                const memeDetails = await Promise.all(
                    res.data.memes.map((meme: Meme) =>
                        axios.get(`/api/memes/${meme.id}`).then((detail) => detail.data)
                    )
                )

                setMemes(memeDetails)
            } catch {
                toast.error("Failed to fetch memes")
            } finally {
                setLoading(false)
            }
        }
        get()
    }, [])

    useEffect(() => {
        return () => {
            if (previewUrl) {
                URL.revokeObjectURL(previewUrl)
            }
        }
    }, [previewUrl])

    function selectFile(e: ChangeEvent<HTMLInputElement>) {
        const selected = e.target.files?.[0]

        if (!selected) {
            setFile(null)
            setPreviewUrl("")
            return
        }

        if (!selected.type.startsWith("image/")) {
            toast.error("Please choose an image file")
            e.target.value = ""
            return
        }

        setFile(selected)
        setPreviewUrl(URL.createObjectURL(selected))
    }

    async function post() {
        if (!file) {
            toast.error("Please choose a meme first")
            return
        }

        try {
            setPosting(true)

            const formData = new FormData()
            formData.append("file", file)

            const uploadRes = await axios.post("/api/upload", formData)
            const memeRes = await axios.post("/api/memes", {
                image: uploadRes.data.url,
            })

            setMemes((current) => [
                {
                    ...memeRes.data.meme,
                    upvotes: 0,
                    downvotes: 0,
                    score: 0,
                    me: null,
                },
                ...current,
            ])
            setFile(null)
            setPreviewUrl("")
            setOpen(false)
            toast.success("Meme uploaded successfully")
        } catch {
            toast.error("Failed to upload meme")
        } finally {
            setPosting(false)
        }
    }

    async function vote(memeId: string, type: "UPVOTE" | "DOWNVOTE") {
        try {
            setVoting(memeId)

            const res = await axios.post(`/api/memes/${memeId}/vote`, { type })

            setMemes((current) =>
                current.map((meme) =>
                    meme.id === memeId
                        ? {
                              ...meme,
                              upvotes: res.data.upvotes,
                              downvotes: res.data.downvotes,
                              score: res.data.score,
                              me: res.data.vote,
                          }
                        : meme
                )
            )
        } catch {
            toast.error("Failed to vote on meme")
        } finally {
            setVoting(null)
        }
    }

    return (
        <PageLayout>
            <PageCenter>
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <Title>Memeland</Title>
                        <Description className="mt-1">
                            Share the best school-safe memes you have.
                        </Description>
                    </div>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>Upload Meme</Button>
                        </DialogTrigger>

                        <DialogContent className="!max-w-lg">
                            <DialogHeader>
                                <PrimaryTitle>Upload a Meme</PrimaryTitle>
                                <DialogDescription>
                                    Pick an image, preview it, then send it to
                                    memeland.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="meme">Meme image</Label>
                                    <Input
                                        id="meme"
                                        type="file"
                                        accept="image/*"
                                        onChange={selectFile}
                                    />
                                </div>

                                {previewUrl ? (
                                    <div className="overflow-hidden rounded-xl border-2 border-border bg-background">
                                        <Image
                                            src={previewUrl}
                                            alt="Selected meme preview"
                                            width={640}
                                            height={640}
                                            unoptimized
                                            className="max-h-80 w-full object-contain"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center rounded-xl border-2 border-dashed border-border bg-background p-6 text-center">
                                        <Image
                                            src="/goose/Camera.png"
                                            alt="A goose with a camera"
                                            width={112}
                                            height={112}
                                            className="h-24 w-24 object-contain"
                                        />
                                        <p className="mt-2 text-sm text-muted-foreground">
                                            No meme selected yet.
                                        </p>
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={posting}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="button"
                                    onClick={post}
                                    disabled={!file || posting}
                                >
                                    {posting ? "Uploading..." : "Post Meme"}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {loading ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        Loading memes...
                    </p>
                ) : memes.length === 0 ? (
                    <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
                        <Image
                            src="/goose/Sleeping 1.png"
                            alt="A sleeping goose"
                            width={128}
                            height={128}
                            className="mx-auto h-28 w-28 object-contain"
                        />
                        <p className="mt-3 text-sm text-muted-foreground">
                            No memes found. Be the first to upload one.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {memes.map((meme) => (
                            <article
                                key={meme.id}
                                className="group relative overflow-hidden rounded-xl border-2 border-border bg-card"
                            >
                                <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border-2 border-border bg-background/90 text-muted-foreground backdrop-blur hover:text-primary"
                                            >
                                                <MoreHorizontal size={16} />
                                                <span className="sr-only">
                                                    More meme actions
                                                </span>
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            className="min-w-[140px] rounded-md border-2 border-border bg-background shadow-none"
                                        >
                                            <DropdownMenuItem
                                                onSelect={() => {
                                                    setReportingMemeId(meme.id)
                                                }}
                                                className="cursor-pointer rounded-sm text-sm font-medium text-primary data-[highlighted]:bg-primary/10 data-[highlighted]:text-primary"
                                            >
                                                Report
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <Image
                                    src={meme.imgUrl}
                                    alt={`Meme by ${meme.author.username}`}
                                    width={600}
                                    height={600}
                                    className="aspect-square w-full bg-background object-contain"
                                />
                                <div className="space-y-3 p-3">
                                    <div className="flex items-center gap-2">
                                        <Avatar size="sm">
                                            <AvatarImage
                                                src={meme.author.image}
                                                alt={meme.author.name}
                                            />
                                            <AvatarFallback>
                                                {meme.author.username[0]?.toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <Link
                                                href={`/@${meme.author.username}`}
                                                className="block truncate text-sm font-semibold text-primary hover:underline"
                                            >
                                                @{meme.author.username}
                                            </Link>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(
                                                    meme.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant={
                                                meme.me === "UPVOTE"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="h-8 gap-1 rounded-full px-3"
                                            disabled={voting === meme.id}
                                            onClick={() => vote(meme.id, "UPVOTE")}
                                        >
                                            Up {meme.upvotes}
                                        </Button>
                                        <Button
                                            type="button"
                                            variant={
                                                meme.me === "DOWNVOTE"
                                                    ? "default"
                                                    : "outline"
                                            }
                                            size="sm"
                                            className="h-8 gap-1 rounded-full px-3"
                                            disabled={voting === meme.id}
                                            onClick={() =>
                                                vote(meme.id, "DOWNVOTE")
                                            }
                                        >
                                            Down {meme.downvotes}
                                        </Button>
                                        <p className="ml-auto text-sm font-semibold text-primary">
                                            Score {meme.score}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
                <ReportAbuse
                    url={
                        reportingMemeId
                            ? `/api/memes/${reportingMemeId}/report`
                            : ""
                    }
                    open={reportingMemeId !== null}
                    onOpen={(reportOpen) => {
                        if (!reportOpen) {
                            setReportingMemeId(null)
                        }
                    }}
                />
            </PageCenter>
        </PageLayout>
    )
}
