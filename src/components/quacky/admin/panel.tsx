// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useState, type FormEvent } from "react";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

// Types
import type { UserSearchResult, UserEditor, PostSearchResult, PostEditor } from "./types";

// Utilities
import { formatTimestamp } from "@/client/utils";
import { Search } from "lucide-react";

function formatDateTimeLocal(value: string | Date | null | undefined) {
    if (!value) {
        return "";
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const offsetMinutes = date.getTimezoneOffset();
    const localTime = new Date(date.getTime() - offsetMinutes * 60_000);

    return localTime.toISOString().slice(0, 16);
}

type UserEditorResponse = Omit<UserEditor, "banExpires"> & {
    banExpires: string | Date | null;
    recentPosts?: unknown;
    postCount?: number;
};

function normalizeUser(user: UserEditorResponse): UserEditor {
    return {
        ...user,
        bio: user.bio ?? "",
        image: user.image ?? "",
        role: user.role ?? "Member",
        banReason: user.banReason ?? "",
        banExpires: formatDateTimeLocal(user.banExpires),
        postCount: typeof user.postCount === "number" ? user.postCount : 0,
    };
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
    const response = await fetch(url, init);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(data?.error || `Request failed (${response.status})`);
    }

    return data as T;
}

type PostEditorResponse = Omit<PostEditor, "attachmentsText" | "authorHandle" | "authorName" | "authorImage" | "authorVerified" | "authorRole"> & {
    attachments?: unknown;
    author?: {
        handle?: string | null;
        name?: string | null;
        image?: string | null;
        verified?: boolean | null;
        role?: string | null;
    } | null;
    recentReplies?: unknown;
    likeCount?: number;
    replyCount?: number;
};

function normalizePost(post: PostEditorResponse): PostEditor {
    return {
        ...post,
        content: post.content ?? "",
        attachmentsText: JSON.stringify(post.attachments ?? null, null, 2),
        authorId: post.authorId ?? "",
        authorHandle: post.author?.handle ?? "",
        authorName: post.author?.name ?? "",
        authorImage: post.author?.image ?? null,
        authorVerified: Boolean(post.author?.verified),
        authorRole: post.author?.role ?? null,
        likeCount: typeof post.likeCount === "number" ? post.likeCount : 0,
        replyCount: typeof post.replyCount === "number" ? post.replyCount : 0,
    };
}


export default function AdminPanel() {
    // States
    const [activeTab, setActiveTab] = useState<"users" | "posts">("users");
    const [userQuery, setUserQuery] = useState("");
    const [postQuery, setPostQuery] = useState("");
    const [userSearching, setUserSearching] = useState(false);
    const [postSearching, setPostSearching] = useState(false);
    const [userSaving, setUserSaving] = useState(false);
    const [postSaving, setPostSaving] = useState(false);
    const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
    const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
    const [selectedUser, setSelectedUser] = useState<UserEditor | null>(null);
    const [selectedPost, setSelectedPost] = useState<PostEditor | null>(null);

    const loadUser = async (userId: string) => {
        const data = await requestJson<{ user: UserEditorResponse }>(`/api/v1/admin/users/${userId}`);
        setSelectedUser(normalizeUser(data.user));
    };

    const loadPost = async (postId: string) => {
        const data = await requestJson<{ post: PostEditorResponse }>(`/api/v1/admin/posts/${postId}`);
        setSelectedPost(normalizePost(data.post));
    };

    const searchUsers = async (value = userQuery) => {
        const query = value.trim();

        if (!query) {
            setUserResults([]);
            return;
        }

        setUserSearching(true);
        try {
            const data = await requestJson<{ users: UserSearchResult[] }>(`/api/v1/admin/users/search?q=${encodeURIComponent(query)}`);
            setUserResults(data.users || []);

            if (data.users?.length === 1) {
                await loadUser(data.users[0].id);
            }
        } finally {
            setUserSearching(false);
        }
    };

    const searchPosts = async (value = postQuery) => {
        const query = value.trim();

        if (!query) {
            setPostResults([]);
            return;
        }

        setPostSearching(true);
        try {
            const data = await requestJson<{ posts: PostSearchResult[] }>(`/api/v1/admin/posts/search?q=${encodeURIComponent(query)}`);
            setPostResults(data.posts || []);

            if (data.posts?.length === 1) {
                await loadPost(data.posts[0].id);
            }
        } finally {
            setPostSearching(false);
        }
    };

    const saveUser = async (extra?: Record<string, unknown>) => {
        if (!selectedUser) {
            return;
        }

        setUserSaving(true);
        try {
            const payload = {
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
            };

            const data = await requestJson<{ user: UserEditorResponse }>(`/api/v1/admin/users/${selectedUser.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setSelectedUser(normalizeUser(data.user));

            if (userQuery.trim()) {
                await searchUsers(userQuery);
            }
        } finally {
            setUserSaving(false);
        }
    };

    const savePost = async (extra?: Record<string, unknown>) => {
        if (!selectedPost) {
            return;
        }

        setPostSaving(true);
        try {
            const payload = {
                content: selectedPost.content,
                attachments: selectedPost.attachmentsText,
                authorHandle: selectedPost.authorHandle,
                pinned: selectedPost.pinned,
                readOnly: selectedPost.readOnly,
                isHidden: selectedPost.isHidden,
                isDeleted: selectedPost.isDeleted,
                ...extra,
            };

            const data = await requestJson<{ post: PostEditorResponse }>(`/api/v1/admin/posts/${selectedPost.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            setSelectedPost(normalizePost(data.post));

            if (postQuery.trim()) {
                await searchPosts(postQuery);
            }
        } finally {
            setPostSaving(false);
        }
    };

    const userSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await searchUsers();
    };

    const postSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await searchPosts();
    };

    const userEditorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await saveUser();
    };

    const postEditorSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        await savePost();
    };

    return (
        <main className="min-h-screen text-white">
            <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8">

                <div className="grid bg-primary/5 border-t border-l border-r sm:grid-cols-2 lg:max-w-[520px]">
                    <Button
                        type="button"
                        variant={activeTab === "users" ? "default" : "ghost"}
                        className="h-12 justify-start rounded-[20px] px-4 text-left"
                        onClick={() => setActiveTab("users")}
                    >
                        Users
                    </Button>
                    <Button
                        type="button"
                        variant={activeTab === "posts" ? "default" : "ghost"}
                        className="h-12 justify-start rounded-[20px] px-4 text-left"
                        onClick={() => setActiveTab("posts")}
                    >
                        Posts
                    </Button>
                </div>

                {activeTab === "users" ? (
                    <section className="grid gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="space-y-6 rounded-[30px] border border-white/10 bg-white/6 p-5 shadow-xl shadow-black/10">
                            <div>
                                <h2 className="text-xl text-primary font-bold">Find a user</h2>
                                <p className="mt-1 text-primary text-sm text-white/60">Search by name, handle, or email.</p>
                            </div>

                            <form className="flex gap-2" onSubmit={userSubmit}>
                                <Input
                                    value={userQuery}
                                    onChange={(event) => setUserQuery(event.target.value)}
                                    placeholder="Search users..."
                                    className="h-11 text-primary border-primary/50 placeholder:text-primary"
                                />

                                <Button type="submit" disabled={userSearching} className="h-11 px-5 cursor-pointer">
                                    <Search className="mr-2 h-4 w-4" />
                                </Button>
                            </form>

                            <div className="space-y-2">
                                {userResults.length > 0 &&
                                    userResults.map((user) => (
                                        <button
                                            key={user.id}
                                            type="button"
                                            onClick={() => loadUser(user.id)}
                                            className="flex w-full gap-3 cursor-pointer border border-white/10 bg-black/20 p-3 text-left "
                                        >
                                            <div className="min-w-0 flex-1">
                                                <Avatar className="w-12 h-12 shrink-0">
                                                    <AvatarImage
                                                        src={user.image || ""}
                                                    />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {user.handle.slice(0, 1).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <p className="truncate text-sm text-white/60">{user.name}</p>
                                                <p className="truncate text-sm text-white/60">@{user.handle}</p>
                                                <p className="truncate text-xs text-white/40">{user.email}</p>
                                            </div>
                                        </button>
                                    ))
                                }
                            </div>

                        </aside>

                        <div className="space-y-6">
                            {selectedUser && (
                                <div className="space-y-6">
                                    <div className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
                                        <form className="rounded-[24px] border border-white/10 bg-black/20 p-4" onSubmit={userEditorSubmit}>
                                            <div className="flex items-start gap-4 border p-4 mb-4">
                                                <Avatar className="h-14 w-14 shrink-0">
                                                    <AvatarImage src={selectedUser.image || ""} />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                        {selectedUser.handle.slice(0, 1).toUpperCase()}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-2xl font-black tracking-tight">{selectedUser.name}</h3>
                                                    <p className="mt-1 text-sm font-medium text-white/70">@{selectedUser.handle}</p>
                                                    <p className="mt-2 text-xs text-white/45">User ID: <span className="font-mono">{selectedUser.id}</span></p>
                                                </div>
                                            </div>

                                            <Button type="submit" disabled={userSaving}>
                                                {userSaving ? "Saving..." : "Save Changes"}
                                            </Button>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="user-name">Name</label>
                                                    <Input id="user-name" value={selectedUser.name} onChange={(event) => setSelectedUser({ ...selectedUser, name: event.target.value })} className="bg-black/25 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="user-handle">Handle</label>
                                                    <Input id="user-handle" value={selectedUser.handle} onChange={(event) => setSelectedUser({ ...selectedUser, handle: event.target.value.replace(/^@+/, "") })} className="bg-black/25 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="user-email">Email</label>
                                                    <Input id="user-email" value={selectedUser.email} onChange={(event) => setSelectedUser({ ...selectedUser, email: event.target.value })} className="bg-black/25 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="user-image">Image URL</label>
                                                    <Input id="user-image" value={selectedUser.image ?? ""} onChange={(event) => setSelectedUser({ ...selectedUser, image: event.target.value })} className="bg-black/25 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="user-role">Role</label>
                                                    <Input id="user-role" value={selectedUser.role ?? ""} onChange={(event) => setSelectedUser({ ...selectedUser, role: event.target.value })} className="bg-black/25 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="user-bio">Bio</label>
                                                    <Textarea id="user-bio" value={selectedUser.bio ?? ""} onChange={(event) => setSelectedUser({ ...selectedUser, bio: event.target.value })} className="min-h-28 resize-none bg-black/25 text-white" />
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Verified</span>
                                                    <Switch
                                                        checked={selectedUser.verified}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedUser({ ...selectedUser, verified: checked })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Email verified</span>
                                                    <Switch
                                                        checked={selectedUser.emailVerified}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedUser({ ...selectedUser, emailVerified: checked })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Private</span>
                                                    <Switch
                                                        checked={selectedUser.privateAccount}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedUser({ ...selectedUser, privateAccount: checked })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Email notifications</span>
                                                    <Switch
                                                        checked={selectedUser.emailNotif}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedUser({ ...selectedUser, emailNotif: checked })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3 col-span-2">
                                                    <span className="text-sm text-white/70">Banned</span>
                                                    <Switch
                                                        checked={!!selectedUser.banned}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedUser({ ...selectedUser, banned: checked })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-2 text-sm text-white/60">
                                                <p>Last updated: {formatTimestamp(selectedUser.updatedAt)}</p>
                                                <p>Joined: {formatTimestamp(selectedUser.createdAt)}</p>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="grid gap-6 2xl:grid-cols-[320px_minmax(0,1fr)]">
                        <aside className="space-y-6 rounded-[30px] border border-white/10 bg-white/6 p-5 shadow-xl shadow-black/10">
                            <div>
                                <h2 className="text-xl font-bold">Find a post</h2>
                                <p className="mt-1 text-sm text-white/60">Search by content, author, or post id.</p>
                            </div>

                            <form className="flex gap-2" onSubmit={postSubmit}>
                                <Input
                                    value={postQuery}
                                    onChange={(event) => setPostQuery(event.target.value)}
                                    placeholder="Search posts..."
                                    className="h-11 bg-black/25 text-white placeholder:text-white/35"
                                />
                                <Button type="submit" disabled={postSearching} className="h-11 px-5">
                                    <Search />
                                </Button>
                            </form>

                            <div className="space-y-2">
                                {postResults.length > 0 && (
                                    postResults.map((post) => (
                                        <button
                                            key={post.id}
                                            type="button"
                                            onClick={() => loadPost(post.id)}
                                            className="cursor-pointer flex w-full items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-left transition hover:border-white/20 hover:bg-black/30"
                                        >
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Avatar className="h-5 w-5 shrink-0">
                                                        <AvatarImage src={post.author.image || ""} />
                                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                            {post.author.handle.slice(0, 1).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <p className="font-small">@{post.author.handle}</p>
                                                </div>
                                                <p className="line-clamp-2 text-sm text-white/60">{post.content}</p>
                                                <p className="text-xs text-white/40">{formatTimestamp(post.createdAt)} • {post._count.likes} likes • {post._count.replies} replies</p>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </aside>

                        <div className="space-y-6 ">
                            {selectedPost && (
                                <div className="space-y-6">
                                    <div className="grid gap-4 2xl:grid-cols-[1.2fr_0.8fr]">
                                        <form className="rounded-[24px] border border-white/10 bg-black/20 p-4" onSubmit={postEditorSubmit}>

                                            <Button type="submit" disabled={postSaving}>
                                                {postSaving ? "Saving..." : "Save"}
                                            </Button>

                                            <div className="grid gap-4 md:grid-cols-2">
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm text-white/65" htmlFor="post-content">Post content</label>
                                                    <Textarea id="post-content" value={selectedPost.content} onChange={(event) => setSelectedPost({ ...selectedPost, content: event.target.value })} className="max-h-64 min-h-36 resize-y overflow-auto bg-black/25 text-white" />
                                                </div>
                                                <div className="space-y-2 md:col-span-2">
                                                    <label className="text-sm text-white/65" htmlFor="post-attachments">Attachments JSON</label>
                                                    <Textarea id="post-attachments" value={selectedPost.attachmentsText} onChange={(event) => setSelectedPost({ ...selectedPost, attachmentsText: event.target.value })} className="max-h-64 min-h-36 resize-y overflow-auto bg-black/25 font-mono text-sm text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="post-author">Author handle</label>
                                                    <Input id="post-author" value={selectedPost.authorHandle} onChange={(event) => setSelectedPost({ ...selectedPost, authorHandle: event.target.value.replace(/^@+/, "") })} className="bg-black/25 text-white" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-sm text-white/65" htmlFor="post-author-id">Author id</label>
                                                    <Input id="post-author-id" value={selectedPost.authorId} readOnly className="bg-black/20 text-white/70" />
                                                </div>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-3">
                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Pinned</span>
                                                    <Switch
                                                        checked={selectedPost.pinned}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedPost({ ...selectedPost, pinned: checked })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Read only</span>
                                                    <Switch
                                                        checked={selectedPost.readOnly}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedPost({ ...selectedPost, readOnly: checked })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Hidden</span>
                                                    <Switch
                                                        checked={selectedPost.isHidden}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedPost({ ...selectedPost, isHidden: checked })
                                                        }
                                                    />
                                                </div>

                                                <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                                                    <span className="text-sm text-white/70">Deleted</span>
                                                    <Switch
                                                        checked={selectedPost.isDeleted}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setSelectedPost({ ...selectedPost, isDeleted: checked })
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 space-y-2 text-sm text-white/60">
                                                <p>Last updated: {formatTimestamp(selectedPost.updatedAt)}</p>
                                                <p>Created: {formatTimestamp(selectedPost.createdAt)}</p>
                                            </div>

                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>
                )}
            </div>
        </main>
    );
}
