// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useState, type FormEvent } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { UserSearchResult, UserEditor, PostSearchResult, PostEditor } from "./types";
import { formatTimestamp } from "@/client/utils";

// ── Helpers ────────────────────────────────────────────────────────────────────

function toDateTimeLocal(value: string | Date | null | undefined): string {
    if (!value) return "";
    const date = value instanceof Date ? value : new Date(value);
    if (isNaN(date.getTime())) return "";
    return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
    const res = await fetch(url, init);
    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error ?? `Request failed (${res.status})`);
    return data as T;
}

// ── Normalisers ────────────────────────────────────────────────────────────────

type RawUser = Omit<UserEditor, "banExpires"> & {
    banExpires?: string | Date | null;
    recentPosts?: unknown;
    postCount?: number;
};

type RawPost = Omit<PostEditor, "attachmentsText" | "authorHandle" | "authorName" | "authorImage" | "authorVerified" | "authorRole"> & {
    attachments?: unknown;
    author?: { handle?: string | null; name?: string | null; image?: string | null; verified?: boolean | null; role?: string | null } | null;
    recentReplies?: unknown;
    likeCount?: number;
    replyCount?: number;
};

const normalizeUser = (u: RawUser): UserEditor => ({
    ...u,
    bio: u.bio ?? "",
    image: u.image ?? "",
    role: u.role ?? "Member",
    banReason: u.banReason ?? "",
    banExpires: toDateTimeLocal(u.banExpires),
    postCount: u.postCount ?? 0,
});

const normalizePost = (p: RawPost): PostEditor => ({
    ...p,
    content: p.content ?? "",
    attachmentsText: JSON.stringify(p.attachments ?? null, null, 2),
    authorId: p.authorId ?? "",
    authorHandle: p.author?.handle ?? "",
    authorName: p.author?.name ?? "",
    authorImage: p.author?.image ?? null,
    authorVerified: Boolean(p.author?.verified),
    authorRole: p.author?.role ?? null,
    likeCount: p.likeCount ?? 0,
    replyCount: p.replyCount ?? 0,
});

// ── Reusable bits ──────────────────────────────────────────────────────────────

function SwitchRow({ label, checked, onChange, wide }: { label: string; checked: boolean; onChange: (v: boolean) => void; wide?: boolean }) {
    return (
        <div className={`flex items-center justify-between border border-white/10 px-4 py-3 ${wide ? "col-span-2" : ""}`}>
            <span className="text-sm text-white/70">{label}</span>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-sm text-white/65" htmlFor={id}>{label}</label>
            {children}
        </div>
    );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AdminPanel() {
    const [tab, setTab] = useState<"users" | "posts">("users");

    const [userQuery, setUserQuery] = useState("");
    const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserEditor | null>(null);
    const [userSearching, setUserSearching] = useState(false);
    const [userSaving, setUserSaving] = useState(false);

    const [postQuery, setPostQuery] = useState("");
    const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
    const [selectedPost, setSelectedPost] = useState<PostEditor | null>(null);
    const [postSearching, setPostSearching] = useState(false);
    const [postSaving, setPostSaving] = useState(false);

    // ── User actions ───────────────────────────────────────────────────────────

    const loadUser = async (id: string) => {
        const { user } = await api<{ user: RawUser }>(`/api/v1/admin/users/${id}`);
        setSelectedUser(normalizeUser(user));
    };

    const searchUsers = async (q = userQuery) => {
        if (!q.trim()) return setUserResults([]);
        setUserSearching(true);
        try {
            const { users } = await api<{ users: UserSearchResult[] }>(`/api/v1/admin/users/search?q=${encodeURIComponent(q)}`);
            setUserResults(users ?? []);
            if (users?.length === 1) await loadUser(users[0].id);
        } finally {
            setUserSearching(false);
        }
    };

    const saveUser = async (extra?: Record<string, unknown>) => {
        if (!selectedUser) return;
        setUserSaving(true);
        try {
            const { user } = await api<{ user: RawUser }>(`/api/v1/admin/users/${selectedUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: selectedUser.name,
                    handle: selectedUser.handle,
                    bio: selectedUser.bio,
                    image: selectedUser.image || null,
                    email: selectedUser.email,
                    role: selectedUser.role,
                    verified: selectedUser.verified,
                    emailVerified: selectedUser.emailVerified,
                    privateAccount: selectedUser.privateAccount,
                    emailNotif: selectedUser.emailNotif,
                    banned: selectedUser.banned,
                    banReason: selectedUser.banReason,
                    banExpires: selectedUser.banExpires || null,
                    ...extra,
                }),
            });
            setSelectedUser(normalizeUser(user));
            if (userQuery.trim()) await searchUsers(userQuery);
        } finally {
            setUserSaving(false);
        }
    };

    // ── Post actions ───────────────────────────────────────────────────────────

    const loadPost = async (id: string) => {
        const { post } = await api<{ post: RawPost }>(`/api/v1/admin/posts/${id}`);
        setSelectedPost(normalizePost(post));
    };

    const searchPosts = async (q = postQuery) => {
        if (!q.trim()) return setPostResults([]);
        setPostSearching(true);
        try {
            const { posts } = await api<{ posts: PostSearchResult[] }>(`/api/v1/admin/posts/search?q=${encodeURIComponent(q)}`);
            setPostResults(posts ?? []);
            if (posts?.length === 1) await loadPost(posts[0].id);
        } finally {
            setPostSearching(false);
        }
    };

    const savePost = async (extra?: Record<string, unknown>) => {
        if (!selectedPost) return;
        setPostSaving(true);
        try {
            const { post } = await api<{ post: RawPost }>(`/api/v1/admin/posts/${selectedPost.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: selectedPost.content,
                    attachments: selectedPost.attachmentsText,
                    authorHandle: selectedPost.authorHandle,
                    pinned: selectedPost.pinned,
                    readOnly: selectedPost.readOnly,
                    isHidden: selectedPost.isHidden,
                    isDeleted: selectedPost.isDeleted,
                    ...extra,
                }),
            });
            setSelectedPost(normalizePost(post));
            if (postQuery.trim()) await searchPosts(postQuery);
        } finally {
            setPostSaving(false);
        }
    };

    // ── Form submit shorthands ─────────────────────────────────────────────────

    const onSubmit = (fn: () => void) => (e: FormEvent) => { e.preventDefault(); fn(); };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen text-white">
            <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-6 sm:px-6 lg:px-8">

                {/* Tab bar */}
                <div className="grid border-l border-r border-t sm:grid-cols-2">
                    {(["users", "posts"] as const).map((t) => (
                        <Button key={t} type="button" variant={tab === t ? "default" : "ghost"}
                            className="h-12 justify-start px-4 text-left capitalize rounded-none"
                            onClick={() => setTab(t)}>
                            {t}
                        </Button>
                    ))}
                </div>

                {tab === "users" ? (
                    <section className="grid gap-4">

                        {/* Search sidebar */}
                        <aside className="space-y-6 border border-white/10 p-5 shadow-xl shadow-black/10">
                            <div>
                                <h2 className="text-xl font-bold text-primary">Find a user</h2>
                                <p className="mt-1 text-sm text-white/60">Search by name, handle, or email.</p>
                            </div>
                            <form className="flex gap-2" onSubmit={onSubmit(() => searchUsers())}>
                                <Input value={userQuery} onChange={(e) => setUserQuery(e.target.value)}
                                    placeholder="Search users..."
                                    className="h-11 text-primary placeholder:text-primary" />
                                <Button type="submit" disabled={userSearching} className="h-11 px-5">
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                            <div className="space-y-2">
                                {userResults.map((user) => (
                                    <button key={user.id} type="button" onClick={() => loadUser(user.id)}
                                        className="flex w-full cursor-pointer gap-3 border border-white/10 p-3 text-left">
                                        <div className="min-w-0 flex-1">
                                            <Avatar className="h-12 w-12 shrink-0">
                                                <AvatarImage src={user.image || ""} />
                                                <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                                    {user.handle[0].toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <p className="truncate text-sm text-white/60">{user.name}</p>
                                            <p className="truncate text-sm text-white/60">@{user.handle}</p>
                                            <p className="truncate text-xs text-white/40">{user.email}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* User editor */}
                        {selectedUser && (
                            <form className="border border-white/10 p-4" onSubmit={onSubmit(saveUser)}>
                                <div className="mb-4 flex items-start gap-4 border p-4">
                                    <Avatar className="h-14 w-14 shrink-0">
                                        <AvatarImage src={selectedUser.image || ""} />
                                        <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                            {selectedUser.handle[0].toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-2xl font-black tracking-tight">{selectedUser.name}</h3>
                                        <p className="mt-1 text-sm font-medium text-white/70">@{selectedUser.handle}</p>
                                        <p className="mt-2 text-xs text-white/45">ID: <span className="font-mono">{selectedUser.id}</span></p>
                                    </div>
                                </div>

                                <Button type="submit" disabled={userSaving} className="mb-4">
                                    {userSaving ? "Saving..." : "Save Changes"}
                                </Button>

                                <div className="grid gap-4 md:grid-cols-2">
                                    {(["name", "handle", "email", "image", "role"] as const).map((key) => (
                                        <Field key={key} id={`user-${key}`} label={key[0].toUpperCase() + key.slice(1)}>
                                            <Input id={`user-${key}`} value={(selectedUser[key] as string) ?? ""}
                                                onChange={(e) => setSelectedUser({ ...selectedUser, [key]: e.target.value })}
                                                className="bg-black/25 text-white" />
                                        </Field>
                                    ))}
                                    <Field id="user-bio" label="Bio">
                                        <Textarea id="user-bio" value={selectedUser.bio ?? ""}
                                            onChange={(e) => setSelectedUser({ ...selectedUser, bio: e.target.value })}
                                            className="min-h-28 resize-none bg-black/25 text-white" />
                                    </Field>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <SwitchRow label="Verified" checked={selectedUser.verified} onChange={(v) => setSelectedUser({ ...selectedUser, verified: v })} />
                                    <SwitchRow label="Email verified" checked={selectedUser.emailVerified} onChange={(v) => setSelectedUser({ ...selectedUser, emailVerified: v })} />
                                    <SwitchRow label="Private" checked={selectedUser.privateAccount} onChange={(v) => setSelectedUser({ ...selectedUser, privateAccount: v })} />
                                    <SwitchRow label="Email notifications" checked={selectedUser.emailNotif} onChange={(v) => setSelectedUser({ ...selectedUser, emailNotif: v })} />
                                    <SwitchRow label="Banned" checked={!!selectedUser.banned} onChange={(v) => setSelectedUser({ ...selectedUser, banned: v })} wide />
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-white/60">
                                    <p>Updated: {formatTimestamp(selectedUser.updatedAt)}</p>
                                    <p>Joined: {formatTimestamp(selectedUser.createdAt)}</p>
                                </div>
                            </form>
                        )}
                    </section>

                ) : (
                    <section className="grid gap-6">
                        <aside className="space-y-6 border border-white/10 p-5">
                            <div>
                                <h2 className="text-xl font-bold">Find a post</h2>
                                <p className="mt-1 text-sm text-white/60">Search by content, author, or post id.</p>
                            </div>
                            <form className="flex gap-2" onSubmit={onSubmit(() => searchPosts())}>
                                <Input value={postQuery} onChange={(e) => setPostQuery(e.target.value)}
                                    placeholder="Search posts..."
                                    className="h-11 bg-black/25 text-white placeholder:text-white" />
                                <Button type="submit" disabled={postSearching} className="h-11 px-5">
                                    <Search />
                                </Button>
                            </form>
                            <div className="space-y-2">
                                {postResults.map((post) => (
                                    <button key={post.id} type="button" onClick={() => loadPost(post.id)}
                                        className="flex w-full cursor-pointer items-start gap-3 border border-white/10 p-3 text-left ">
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Avatar className="h-5 w-5 shrink-0">
                                                    <AvatarImage src={post.author.image || ""} />
                                                    <AvatarFallback className="bg-primary/10 font-bold text-primary">
                                                        {post.author.handle[0].toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p>@{post.author.handle}</p>
                                            </div>
                                            <p className="line-clamp-2 text-sm text-white/60">{post.content}</p>
                                            <p className="text-xs text-white/40">
                                                {formatTimestamp(post.createdAt)} · {post._count.likes} likes · {post._count.replies} replies
                                            </p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </aside>

                        {/* Post editor */}
                        {selectedPost && (
                            <form className="border border-white/10 p-4" onSubmit={onSubmit(savePost)}>
                                <Button type="submit" disabled={postSaving} className="mb-4">
                                    {postSaving ? "Saving..." : "Save"}
                                </Button>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <Field id="post-content" label="Content">
                                        <Textarea id="post-content" value={selectedPost.content}
                                            onChange={(e) => setSelectedPost({ ...selectedPost, content: e.target.value })}
                                            className="col-span-2 max-h-64 min-h-36 resize-y overflow-auto bg-black/25 text-white" />
                                    </Field>
                                    <Field id="post-attachments" label="Attachments JSON">
                                        <Textarea id="post-attachments" value={selectedPost.attachmentsText}
                                            onChange={(e) => setSelectedPost({ ...selectedPost, attachmentsText: e.target.value })}
                                            className="col-span-2 max-h-64 min-h-36 resize-y overflow-auto bg-black/25 font-mono text-sm text-white" />
                                    </Field>
                                    <Field id="post-author" label="Author handle">
                                        <Input id="post-author" value={selectedPost.authorHandle}
                                            onChange={(e) => setSelectedPost({ ...selectedPost, authorHandle: e.target.value.replace(/^@+/, "") })}
                                            className="bg-black/25 text-white" />
                                    </Field>
                                    <Field id="post-author-id" label="Author ID">
                                        <Input id="post-author-id" value={selectedPost.authorId} readOnly className="bg-black/20 text-white/70" />
                                    </Field>
                                </div>

                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <SwitchRow label="Pinned" checked={selectedPost.pinned} onChange={(v) => setSelectedPost({ ...selectedPost, pinned: v })} />
                                    <SwitchRow label="Read only" checked={selectedPost.readOnly} onChange={(v) => setSelectedPost({ ...selectedPost, readOnly: v })} />
                                    <SwitchRow label="Hidden" checked={selectedPost.isHidden} onChange={(v) => setSelectedPost({ ...selectedPost, isHidden: v })} />
                                    <SwitchRow label="Deleted" checked={selectedPost.isDeleted} onChange={(v) => setSelectedPost({ ...selectedPost, isDeleted: v })} />
                                </div>

                                <div className="mt-4 space-y-1 text-sm text-white/60">
                                    <p>Updated: {formatTimestamp(selectedPost.updatedAt)}</p>
                                    <p>Created: {formatTimestamp(selectedPost.createdAt)}</p>
                                </div>
                            </form>
                        )}
                    </section>
                )}
            </div>
        </main>
    );
}
