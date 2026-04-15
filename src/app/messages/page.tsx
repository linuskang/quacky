"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { authClient } from "@/client/auth";
import { formatTimestamp } from "@/client/utils";

import Sidebar from "@/components/quacky/sidebar";
import Login from "@/components/login";
import Loading from "@/components/loading";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BadgeCheck, MessageSquare, SendHorizonal, ArrowLeft, Search } from "lucide-react";
import type { DMConversation, DMMessage, DMUserPreview } from "@/types";

interface ListResponse {
    success: boolean;
    conversations: DMConversation[];
    error?: string;
}

interface ThreadResponse {
    success: boolean;
    conversation: {
        id: string;
        createdAt: string;
        updatedAt: string;
        lastMessageAt: string | null;
        participant: DMUserPreview | null;
        messages: DMMessage[];
    };
    error?: string;
}

interface SearchResponse {
    success: boolean;
    users: DMUserPreview[];
    error?: string;
}

interface ConversationCreateResponse {
    success: boolean;
    conversation?: {
        id: string;
    };
    error?: string;
}

export default function MessagesPage() {
    return (
        <Suspense fallback={<Loading />}>
            <MessagesPageContent />
        </Suspense>
    );
}

function MessagesPageContent() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [conversations, setConversations] = useState<DMConversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<DMMessage[]>([]);

    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [sending, setSending] = useState(false);
    const [creatingConversation, setCreatingConversation] = useState(false);

    const [composer, setComposer] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<DMUserPreview[]>([]);
    const [searchError, setSearchError] = useState<string | null>(null);

    const selectedConversation = useMemo(() => {
        if (!selectedConversationId) {
            return null;
        }

        return conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;
    }, [conversations, selectedConversationId]);

    useEffect(() => {
        if (!session) {
            return;
        }

        loadConversations();
    }, [session]);

    useEffect(() => {
        if (!session) {
            return;
        }

        const requestedConversationId = searchParams.get("c");

        if (!conversations.length) {
            setSelectedConversationId(null);
            setMessages([]);
            return;
        }

        setSelectedConversationId((current) => {
            if (requestedConversationId && conversations.some((conversation) => conversation.id === requestedConversationId)) {
                return requestedConversationId;
            }

            if (current && conversations.some((conversation) => conversation.id === current)) {
                return current;
            }

            return conversations[0].id;
        });
    }, [conversations, searchParams, session]);

    useEffect(() => {
        if (!selectedConversationId || !session) {
            return;
        }

        loadConversation(selectedConversationId, true);
    }, [selectedConversationId, session]);

    useEffect(() => {
        if (!session) {
            return;
        }

        const normalized = searchQuery.trim();

        if (!normalized) {
            setSearchResults([]);
            return;
        }

        const controller = new AbortController();

        const fetchUsers = async () => {
            const res = await fetch(`/api/v1/messages/users/search?q=${encodeURIComponent(normalized)}`, {
                signal: controller.signal,
            });
            const data = await res.json() as SearchResponse;

            if (!res.ok || !data.success) {
                setSearchResults([]);
                return;
            }

            setSearchResults(data.users ?? []);
        };

        fetchUsers().catch((error) => {
            if (error instanceof Error && error.name === "AbortError") {
                return;
            }

            setSearchResults([]);
        });

        return () => controller.abort();
    }, [searchQuery, session]);

    async function loadConversations() {
        try {
            setLoadingConversations(true);

            const res = await fetch("/api/v1/messages/conversations");
            const data = await res.json() as ListResponse;

            if (!res.ok || !data.success) {
                setConversations([]);
                return [] as DMConversation[];
            }

            const next = data.conversations ?? [];
            setConversations(next);
            return next;
        } finally {
            setLoadingConversations(false);
        }
    }

    async function loadConversation(conversationId: string, markRead = false) {
        try {
            setLoadingMessages(true);

            const res = await fetch(`/api/v1/messages/conversations/${conversationId}`);
            const data = await res.json() as ThreadResponse;

            if (!res.ok || !data.success) {
                setMessages([]);
                return;
            }

            setMessages(data.conversation.messages ?? []);

            if (markRead) {
                await fetch(`/api/v1/messages/conversations/${conversationId}/read`, {
                    method: "PATCH",
                });

                setConversations((current) => current.map((conversation) => (
                    conversation.id === conversationId
                        ? { ...conversation, unreadCount: 0 }
                        : conversation
                )));
            }
        } finally {
            setLoadingMessages(false);
        }
    }

    function openConversation(conversationId: string) {
        setSelectedConversationId(conversationId);

        const params = new URLSearchParams(searchParams.toString());
        params.set("c", conversationId);
        router.replace(`/messages?${params.toString()}`);
    }

    async function startConversation(user: DMUserPreview) {
        if (creatingConversation) {
            return;
        }

        try {
            setCreatingConversation(true);
            setSearchError(null);

            const res = await fetch("/api/v1/messages/conversations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    targetUserId: user.id,
                }),
            });

            const data = await res.json() as ConversationCreateResponse;

            if (!res.ok || !data.success || !data.conversation?.id) {
                setSearchError(data.error ?? "Could not start conversation.");
                return;
            }

            const conversationId = data.conversation.id;

            setSearchQuery("");
            setSearchResults([]);

            await loadConversations();
            openConversation(conversationId);
            await loadConversation(conversationId, true);
        } catch {
            setSearchError("Could not start conversation.");
        } finally {
            setCreatingConversation(false);
        }
    }

    async function sendMessage() {
        if (!selectedConversationId || sending) {
            return;
        }

        const content = composer.trim();

        if (!content || content.length > 1000) {
            return;
        }

        setSending(true);

        const optimisticId = `optimistic-${Date.now()}`;
        const optimisticMessage: DMMessage = {
            id: optimisticId,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            senderId: session?.user.id ?? "",
            sender: {
                id: session?.user.id ?? "",
                name: session?.user.name ?? "You",
                handle: session?.user.handle ?? "you",
                image: session?.user.image ?? null,
                verified: false,
            },
        };

        setMessages((current) => [...current, optimisticMessage]);
        setComposer("");

        try {
            const res = await fetch(`/api/v1/messages/conversations/${selectedConversationId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ content }),
            });

            const data = await res.json();

            if (!res.ok || !data.success || !data.message) {
                setMessages((current) => current.filter((message) => message.id !== optimisticId));
                return;
            }

            setMessages((current) => current.map((message) => (
                message.id === optimisticId ? data.message as DMMessage : message
            )));

            setConversations((current) => current.map((conversation) => (
                conversation.id === selectedConversationId
                    ? {
                        ...conversation,
                        lastMessageAt: (data.message.createdAt as string) ?? new Date().toISOString(),
                        lastMessage: {
                            id: data.message.id as string,
                            content: data.message.content as string,
                            createdAt: data.message.createdAt as string,
                            senderId: data.message.senderId as string,
                        },
                    }
                    : conversation
            )).sort((a, b) => {
                const left = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
                const right = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
                return right - left;
            }));
        } finally {
            setSending(false);
        }
    }

    if (isPending) {
        return <Loading />;
    }

    if (!session) {
        return <Login />;
    }

    const isMobileThreadOpen = Boolean(selectedConversationId);

    return (
        <main className="min-h-screen w-full flex justify-center bg-background">
            <div className="flex w-full max-w-[1050px] gap-4 px-4 pb-24 lg:pb-8">
                <Sidebar session={session} />

                <section className="flex-1 flex flex-col gap-4 pt-8 w-full min-w-0">
                    <div className="rounded-xl border border-border bg-[var(--lynt)] overflow-hidden min-h-[72vh] lg:min-h-[calc(100vh-4rem)] flex">
                        <aside className={`w-full md:w-[340px] md:block border-r border-border ${isMobileThreadOpen ? "hidden" : "block"}`}>
                            <div className="p-4 border-b border-border">
                                <h1 className="text-xl font-bold text-primary">Messages</h1>
                                <p className="text-sm text-muted-foreground mt-1">Direct messages, X-style.</p>
                            </div>

                            <div className="p-4 border-b border-border">
                                <div className="rounded-xl border border-border bg-background/70 px-3 py-2 flex items-center gap-2">
                                    <Search size={16} className="text-muted-foreground" />
                                    <input
                                        value={searchQuery}
                                        onChange={(event) => setSearchQuery(event.target.value)}
                                        placeholder="New message"
                                        className="w-full bg-transparent text-sm text-primary outline-none placeholder:text-muted-foreground"
                                    />
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="mt-2 rounded-xl border border-border bg-background overflow-hidden">
                                        {searchResults.map((user) => (
                                            <button
                                                type="button"
                                                key={user.id}
                                                onClick={() => startConversation(user)}
                                                disabled={creatingConversation}
                                                className="w-full px-3 py-2 text-left hover:bg-accent/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="size-8">
                                                        <AvatarImage src={user.image ?? ""} alt={user.name} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-1">
                                                            <span className="truncate text-sm font-bold text-primary">{user.name}</span>
                                                            {user.verified && (
                                                                <BadgeCheck size={14} className="text-primary" fill="currentColor" stroke="var(--lynt)" />
                                                            )}
                                                        </div>
                                                        <span className="text-xs font-semibold text-muted-foreground">@{user.handle}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchError && (
                                    <p className="mt-2 text-xs font-semibold text-red-500">{searchError}</p>
                                )}
                            </div>

                            <div className="max-h-[55vh] md:max-h-[calc(72vh-10rem)] overflow-y-auto">
                                {loadingConversations && (
                                    <div className="p-6 text-sm text-muted-foreground">Loading conversations...</div>
                                )}

                                {!loadingConversations && conversations.length === 0 && (
                                    <div className="p-8 text-center">
                                        <MessageSquare size={40} className="mx-auto text-primary" />
                                        <h2 className="mt-3 text-base font-bold text-primary">No messages yet</h2>
                                        <p className="mt-1 text-sm text-muted-foreground">Search for someone to start chatting.</p>
                                    </div>
                                )}

                                {conversations.map((conversation) => {
                                    const active = conversation.id === selectedConversationId;

                                    return (
                                        <button
                                            key={conversation.id}
                                            onClick={() => openConversation(conversation.id)}
                                            className={`w-full p-4 border-b border-border text-left transition-colors ${active ? "bg-accent/40" : "hover:bg-accent/30"}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <Avatar className="size-10">
                                                    <AvatarImage src={conversation.participant?.image ?? ""} alt={conversation.participant?.name ?? "Unknown"} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {(conversation.participant?.name ?? "?").charAt(0).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>

                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1">
                                                        <span className="truncate font-bold text-primary text-sm">{conversation.participant?.name ?? "Unknown"}</span>
                                                        {conversation.participant?.verified && (
                                                            <BadgeCheck size={15} className="text-primary" fill="currentColor" stroke="var(--lynt)" />
                                                        )}
                                                    </div>

                                                    <div className="flex items-center justify-between gap-2 mt-0.5">
                                                        <span className="truncate text-xs font-semibold text-muted-foreground">
                                                            @{conversation.participant?.handle ?? "unknown"}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {conversation.lastMessageAt ? formatTimestamp(conversation.lastMessageAt) : ""}
                                                        </span>
                                                    </div>

                                                    <p className="mt-1 truncate text-xs text-muted-foreground">
                                                        {conversation.lastMessage?.content || "Start the conversation"}
                                                    </p>
                                                </div>

                                                {conversation.unreadCount > 0 && (
                                                    <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-background">
                                                        {conversation.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <section className={`flex-1 ${isMobileThreadOpen ? "flex" : "hidden"} md:flex flex-col`}>
                            {!selectedConversation && (
                                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                                    <MessageSquare size={46} className="text-primary" />
                                    <h2 className="mt-3 text-lg font-bold text-primary">Pick a conversation</h2>
                                    <p className="mt-1 text-sm text-muted-foreground">Your thread will appear here.</p>
                                </div>
                            )}

                            {selectedConversation && (
                                <>
                                    <div className="border-b border-border p-4 flex items-center gap-3">
                                        <button
                                            className="md:hidden rounded-md p-1 hover:bg-accent/40"
                                            onClick={() => setSelectedConversationId(null)}
                                        >
                                            <ArrowLeft size={18} />
                                        </button>

                                        <Avatar className="size-9">
                                            <AvatarImage src={selectedConversation.participant?.image ?? ""} alt={selectedConversation.participant?.name ?? "Unknown"} />
                                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                {(selectedConversation.participant?.name ?? "?").charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1">
                                                <span className="truncate text-sm font-bold text-primary">{selectedConversation.participant?.name ?? "Unknown"}</span>
                                                {selectedConversation.participant?.verified && (
                                                    <BadgeCheck size={15} className="text-primary" fill="currentColor" stroke="var(--lynt)" />
                                                )}
                                            </div>
                                            <Link href={`/${selectedConversation.participant?.handle ?? ""}`} className="text-xs font-semibold text-muted-foreground hover:underline">
                                                @{selectedConversation.participant?.handle ?? "unknown"}
                                            </Link>
                                        </div>
                                    </div>

                                    <div className="flex-1 p-4 overflow-y-auto space-y-2">
                                        {loadingMessages && (
                                            <div className="text-sm text-muted-foreground">Loading messages...</div>
                                        )}

                                        {!loadingMessages && messages.length === 0 && (
                                            <div className="h-full flex items-center justify-center">
                                                <div className="text-center">
                                                    <h3 className="text-base font-bold text-primary">Say hi</h3>
                                                    <p className="text-sm text-muted-foreground mt-1">Start your conversation.</p>
                                                </div>
                                            </div>
                                        )}

                                        {messages.map((message) => {
                                            const mine = message.senderId === session.user.id;

                                            return (
                                                <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${mine ? "bg-primary text-background" : "bg-background/80 border border-border text-primary"}`}>
                                                        <p className="text-sm whitespace-pre-line break-words">{message.content}</p>
                                                        <p className={`mt-1 text-[10px] ${mine ? "text-background/80" : "text-muted-foreground"}`}>
                                                            {formatTimestamp(message.createdAt)}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    <div className="border-t border-border p-3 flex items-end gap-2">
                                        <textarea
                                            value={composer}
                                            onChange={(event) => setComposer(event.target.value)}
                                            placeholder="Send a message"
                                            className="flex-1 min-h-[44px] max-h-36 rounded-xl border border-border bg-background/80 p-3 text-sm text-primary outline-none placeholder:text-muted-foreground resize-none"
                                        />

                                        <button
                                            onClick={() => void sendMessage()}
                                            disabled={sending || !composer.trim()}
                                            className="h-11 w-11 rounded-xl bg-primary text-background disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center"
                                        >
                                            <SendHorizonal size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </section>
                    </div>
                </section>

            </div>
        </main>
    );
}
