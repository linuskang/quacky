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
import { useEffect, useState } from "react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"

// Components
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Description, Title } from "@/components/text"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ArrowBigUp, ArrowBigDown } from "lucide-react"

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
    const { id } = useParams<{ id: string }>()
    const [meme, setMeme] = useState<Meme | null>(null)
    const [loading, setLoading] = useState(true)
    const [voting, setVoting] = useState(false)

    useEffect(() => {
        void (async () => {
            try {
                const res = await axios.get(`/api/memes/${id}`)
                setMeme(res.data.data)
            } catch {
                toast.error("Failed to fetch meme")
            } finally {
                setLoading(false)
            }
        })()
    }, [id])

    async function vote(type: "UPVOTE" | "DOWNVOTE") {
        if (!meme) return

        try {
            setVoting(true)
            const res = await axios.post(`/api/memes/${meme.id}/vote`, { type })
            setMeme((current) =>
                current
                    ? {
                        ...current,
                        upvotes: res.data.data.upvotes,
                        downvotes: res.data.data.downvotes,
                        score: res.data.data.score,
                        me: res.data.data.vote,
                    }
                    : null
            )
        } catch {
            toast.error("Failed to vote on meme")
        } finally {
            setVoting(false)
        }
    }

    return (
        <PageLayout>
            <PageCenter>

                {loading ? (
                    <p className="py-10 text-center text-sm text-muted-foreground">
                        Loading meme...
                    </p>
                ) : !meme ? (
                    <div className="rounded-xl border-2 border-dashed border-border bg-card p-8 text-center">
                        <p className="text-sm text-muted-foreground">
                            Meme not found.
                        </p>
                    </div>
                ) : (
                    <article className="overflow-hidden border">
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
                                        Posted{" "}
                                        {new Date(
                                            meme.createdAt
                                        ).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex w-fit items-center gap-0 rounded-full border-2 border-border bg-background p-0">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className={`h-8 w-8 rounded-full p-0 ${meme.me === "UPVOTE"
                                        ? "text-blue-500 hover:text-blue-600"
                                        : "text-muted-foreground"
                                        }`}
                                    disabled={voting}
                                    onClick={() => vote("UPVOTE")}
                                >
                                    <ArrowBigUp className="h-10 w-10" />
                                </Button>

                                <span className="text-center text-xs font-medium">
                                    {meme.score}
                                </span>

                                <Button
                                    type="button"
                                    variant="ghost"
                                    className={`h-8 w-8 rounded-full p-0 ${meme.me === "DOWNVOTE"
                                        ? "text-blue-500 hover:text-blue-600"
                                        : "text-muted-foreground"
                                        }`}
                                    disabled={voting}
                                    onClick={() => vote("DOWNVOTE")}
                                >
                                    <ArrowBigDown className="h-10 w-10" />
                                </Button>
                            </div>
                        </div>
                    </article>
                )}
            </PageCenter>
        </PageLayout>
    )
}
