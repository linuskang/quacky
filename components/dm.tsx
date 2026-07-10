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
import { useState, useRef, useEffect } from "react"

// Components
import { ArrowUp } from "lucide-react"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { Message, MessageContent } from "@/components/ui/message"
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group"
import {
    Card,
    CardTitle,
    CardContent,
    CardHeader,
    CardDescription,
} from "@/components/ui/card"

// Types
import type { Dm, User } from "@/types"
interface Props {
    other: User
    currentUserId: string
    initialMessages: Dm[]
}

// Utils
function dayKey(iso: string) {
    const d = new Date(iso)
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}-${d.getUTCDate()}`
}

function formatDay(iso: string) {
    const d = new Date(iso)
    const now = new Date()
    if (dayKey(iso) === dayKey(now.toISOString())) return "Today"

    return d.toLocaleDateString("en-GB", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year:
            now.getUTCFullYear() === d.getUTCFullYear() ? undefined : "numeric",
        timeZone: "UTC",
    })
}

export function Dm({ other, currentUserId, initialMessages }: Props) {
    const [messages, setMessages] = useState<Dm[]>(initialMessages)
    const [draft, setDraft] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" })
    }, [messages.length])

    async function send() {
        const message = draft.trim()
        setDraft("")
        const res = await axios.post(`/api/dms/${other.username}`, {
            message,
        })
        const dm = (await res.data) as Dm
        setMessages((prev) => [...prev, dm])
    }

    return (
        <section className="flex min-h-0 flex-col">
            <header className="fixed top-0 z-10 flex w-full max-w-xl items-center justify-between bg-background px-4 py-3">
                <div className="flex gap-3">
                    <Avatar className="h-11 w-11">
                        <AvatarImage src={other.image} />
                    </Avatar>

                    <div>
                        <h2 className="truncate text-base font-bold">
                            {other.name}
                        </h2>
                        <p className="truncate text-sm text-muted-foreground">
                            @{other.username}
                        </p>
                    </div>
                </div>
            </header>

            <div className="fixed top-[68px] bottom-[88px] w-full max-w-xl scrollbar-none overflow-y-auto px-4">
                <div className="flex min-h-full flex-col justify-end space-y-4">
                    {messages.length === 0 ? (
                        <Card className="mx-auto w-full max-w-xs">
                            <CardHeader className="justify-center">
                                <Avatar className="mb-2 h-16 w-16">
                                    <AvatarImage src={other.image} />
                                </Avatar>

                                <CardTitle>{other.name}</CardTitle>
                                <CardDescription className="-mt-1">
                                    @{other.username}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="-mt-2 text-center">
                                <p className="text-sm text-muted-foreground">
                                    This is the beginning of your conversation
                                    with {other.name}.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        messages.map((dm, i) => {
                            const mine = dm.sender.id === currentUserId
                            const prev = i > 0 ? messages[i - 1] : null
                            const showDay =
                                !prev ||
                                dayKey(prev.createdAt) !== dayKey(dm.createdAt)

                            return (
                                <div key={dm.id} className="space-y-2">
                                    {showDay && (
                                        <div className="flex justify-center">
                                            <span className="text-xs font-semibold text-primary">
                                                {formatDay(dm.createdAt)}
                                            </span>
                                        </div>
                                    )}
                                    <Message align={mine ? "end" : "start"}>
                                        <MessageContent>
                                            <Bubble variant="ghost">
                                                <BubbleContent
                                                    className={
                                                        mine
                                                            ? "!rounded-2xl !rounded-br-md !bg-primary-2 !px-3 !py-2 text-sm leading-5 !text-primary-foreground"
                                                            : "!rounded-2xl !rounded-bl-md !bg-card !px-3 !py-2 text-sm leading-5"
                                                    }
                                                >
                                                    {dm.message}
                                                </BubbleContent>
                                            </Bubble>
                                        </MessageContent>
                                    </Message>
                                </div>
                            )
                        })
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            <div className="fixed bottom-4 w-full max-w-xl bg-background px-4 pt-2">
                <InputGroup className="h-auto items-end !rounded-full p-2">
                    <InputGroupInput
                        ref={inputRef}
                        placeholder={`Message ${other.name}...`}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault()
                                send()
                            }
                        }}
                    />
                    <InputGroupAddon align="inline-end" className="p-0">
                        <InputGroupButton
                            size="icon-sm"
                            className="mr-1 rounded-full bg-primary-2 text-primary-foreground hover:!bg-primary-2/80"
                            onClick={() => send()}
                            disabled={!draft.trim()}
                        >
                            <ArrowUp strokeWidth={3} />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        </section>
    )
}
