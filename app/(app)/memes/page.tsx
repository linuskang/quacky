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
import { MoreHorizontal, ArrowUp, ArrowDown, ArrowBigUp, ArrowBigDown } from "lucide-react"
import { Form } from "@/components/ui/form"

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
    async function get() {
        try {
            const res = await axios.get("/api/memes")
            const memeDetails = await Promise.all(
                res.data.data.map((meme: Meme) =>
                    axios
                        .get(`/api/memes/${meme.id}`)
                        .then((detail) => detail.data.data)
                )
            )

            setMemes(memeDetails)
        } catch {
            toast.error("Failed to fetch memes")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {

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


    async function vote(memeId: string, type: "UPVOTE" | "DOWNVOTE") {
        try {
            setVoting(memeId)

            const res = await axios.post(`/api/memes/${memeId}/vote`, { type })

            setMemes((current) =>
                current.map((meme) =>
                    meme.id === memeId
                        ? {
                            ...meme,
                            upvotes: res.data.data.upvotes,
                            downvotes: res.data.data.downvotes,
                            score: res.data.data.score,
                            me: res.data.data.vote,
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
                            Share the coolest memes here!
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

                            <Form<{ meme: FileList }>
                                onSubmit={async (data) => {
                                    const selectedFile = data.meme?.[0]

                                    if (!selectedFile) {
                                        toast.error("you havent uploaded one yet")
                                        return
                                    }

                                    try {
                                        setPosting(true)

                                        const formData = new FormData()
                                        formData.append("file", selectedFile)

                                        const uploadedImage = await axios.post("/api/upload", formData)
                                        await axios.post("/api/memes", {
                                            image: uploadedImage.data.url,
                                        })

                                        setFile(null)
                                        setPreviewUrl("")
                                        setOpen(false)

                                        get()
                                        toast.success("Meme uploaded successfully")
                                    } catch {
                                        toast.error("Failed to upload meme")
                                    } finally {
                                        setPosting(false)
                                    }
                                }}
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Form.Label name="meme">Meme image</Form.Label>
                                        <Form.Field
                                            name="meme"
                                        >
                                            {(controller) => (
                                                <Input
                                                    id="meme"
                                                    type="file"
                                                    accept=".png,image/png"
                                                    onChange={(e) => {
                                                        const selected = e.target.files?.[0]

                                                        if (selected && !selected.type.startsWith("image/")) {
                                                            toast.error("Please choose an image file")
                                                            e.target.value = ""
                                                            controller.field.onChange(null)
                                                            setFile(null)
                                                            setPreviewUrl("")
                                                            return
                                                        }

                                                        controller.field.onChange(e.target.files)
                                                        selectFile(e)
                                                    }}
                                                    ref={controller.field.ref}
                                                    name={controller.field.name}
                                                />
                                            )}
                                        </Form.Field>
                                    </div>

                                    {previewUrl && (
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
                                    <Form.Submit>
                                        <Button disabled={!file || posting}>
                                            {posting ? "Uploading..." : "Post Meme"}
                                        </Button>
                                    </Form.Submit>
                                </DialogFooter>

                            </Form>
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
                            No memes ??
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {memes.map((meme) => (
                            <article
                                key={meme.id}
                                className="group relative overflow-hidden border-2 rounded-lg"
                            >
                                <div className="absolute top-2 right-2 z-10 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-full bg-background/90 text-muted-foreground backdrop-blur hover:text-primary"
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
                                <div className="space-y-3 p-4">
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
                                                Posted {" "}{new Date(
                                                    meme.createdAt
                                                ).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-0 rounded-full border-2 border-border bg-background p-0 w-fit">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className={`h-8 w-8 p-0 rounded-full ${meme.me === "UPVOTE"
                                                ? "text-blue-500 hover:text-blue-600"
                                                : "text-muted-foreground"
                                                }`}
                                            disabled={voting === meme.id}
                                            onClick={() => vote(meme.id, "UPVOTE")}
                                        >
                                            <ArrowBigUp className="h-10 w-10" />
                                        </Button>

                                        <span className="text-center text-xs font-medium">
                                            {meme.score}
                                        </span>

                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className={`h-8 w-8 p-0 rounded-full ${meme.me === "DOWNVOTE"
                                                ? "text-blue-500 hover:text-blue-600"
                                                : "text-muted-foreground"
                                                }`}
                                            disabled={voting === meme.id}
                                            onClick={() => vote(meme.id, "DOWNVOTE")}
                                        >
                                            <ArrowBigDown className="h-10 w-10" />
                                        </Button>
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
        </PageLayout >
    )
}
