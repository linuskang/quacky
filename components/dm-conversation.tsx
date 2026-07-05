"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp } from "lucide-react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { Card, CardTitle, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import type { Dm, User } from "@/types";
import { toast } from "sonner";

function dayKey(iso: string) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function formatDayDivider(iso: string) {
    const d = new Date(iso);
    const now = new Date();
    const sameDay =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();
    if (sameDay) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
        d.getFullYear() === yesterday.getFullYear() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getDate() === yesterday.getDate();
    if (isYesterday) return "Yesterday";

    return d.toLocaleDateString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: now.getFullYear() === d.getFullYear() ? undefined : "numeric",
    });
}

interface Props {
    other: User;
    currentUserId: string;
    initialMessages: Dm[];
}

export function DmConversation({ other, currentUserId, initialMessages }: Props) {
    const [messages, setMessages] = useState<Dm[]>(initialMessages);
    const [draft, setDraft] = useState("");
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "auto" });
    }, [messages.length]);

    async function send() {
        const message = draft.trim();
        if (!message) return;

        setDraft("");

        const res = await fetch(`/api/dms/${other.username}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message }),
        });

        if (!res.ok) {
            toast.error(res.statusText);
            setDraft(message);
            return;
        }

        const dm = (await res.json()) as Dm;
        setMessages((prev) => [...prev, dm]);
    }

    return (
        <section className="flex min-h-0 flex-col">
            <header className="fixed top-0 z-10 flex w-full max-w-xl items-center justify-between bg-background px-4 py-3">
                <div className="flex gap-3">
                    <Avatar className="h-11 w-11">
                        <AvatarImage src={other.image} />
                    </Avatar>

                    <div>
                        <h2 className="truncate text-base font-bold">{other.name}</h2>
                        <p className="truncate text-sm text-muted-foreground">@{other.username}</p>
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
                                <CardDescription className="-mt-1">@{other.username}</CardDescription>
                            </CardHeader>

                            <CardContent className="-mt-2 text-center">
                                <p className="text-sm text-muted-foreground">
                                    This is the beginning of your conversation with {other.name}.
                                </p>
                            </CardContent>
                        </Card>
                    ) : (
                        messages.map((dm, i) => {
                            const mine = dm.sender.id === currentUserId;
                            const prev = i > 0 ? messages[i - 1] : null;
                            const showDay = !prev || dayKey(prev.createdAt) !== dayKey(dm.createdAt);

                            return (
                                <div key={dm.id} className="space-y-2">
                                    {showDay && (
                                        <div className="flex justify-center">
                                            <span className="text-xs font-semibold text-primary">
                                                {formatDayDivider(dm.createdAt)}
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
                            );
                        })
                    )}
                    <div ref={bottomRef} />
                </div>
            </div>

            <div className="fixed bottom-4 w-full max-w-xl bg-background px-4 pt-2">
                <InputGroup className="h-auto items-end !rounded-full !ring-0 border-2 border-border p-2 focus-within:border-primary-2 dark:bg-background">
                    <InputGroupInput
                        ref={inputRef}
                        placeholder={`Message ${other.name}...`}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void send();
                            }
                        }}
                    />
                    <InputGroupAddon align="inline-end" className="p-0">
                        <InputGroupButton
                            size="icon-sm"
                            className="mr-1 rounded-full bg-primary-2 text-primary-foreground hover:!bg-primary-2/80"
                            onClick={() => void send()}
                            disabled={!draft.trim()}
                        >
                            <ArrowUp strokeWidth={3} />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </div>
        </section>
    );
}