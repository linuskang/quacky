// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

export interface User {
    id: string;

    name: string;
    handle: string;
    email: string;
    image?: string;
    bio?: string;

    verified: boolean;
    role: string;

    emailNotif: boolean;
    privateAccount: boolean;

    followers?: number;
    following?: number;
    posts?: number;

    createdAt: Date;
    updatedAt: Date;

    banned: boolean;
    bannedAt?: Date;
    banReason?: string;
}

export type PostType = "post" | "reply" | "repost" | "quote";

export interface Post {
    id: string;
    type: PostType;

    author: {
        id: string;
        name: string;
        handle: string;
        image?: string | null;
        verified: boolean;
    };

    content: string;
    attachments?: PostAttachment[];

    // Self-referencing: parent post for replies, reposts, and quotes
    parentId?: string | null;
    parent?: Post | null;

    // Direct replies to this post
    children?: Post[];

    viewCount: number;
    replyCount?: number;
    repostCount?: number;

    createdAt: string | Date;

    readOnly: boolean;
    pinned: boolean;
    isHidden: boolean;
    isDeleted: boolean;

    likes?: Likes[];

    hasLiked?: boolean;
    hasReposted?: boolean;
    hasReplied?: boolean;
    hasBookmarked?: boolean;
}

export interface Likes {
    userId: string;
    postId: string;
    user: {
        id: string;
        name: string;
        handle: string;
        image?: string;
        verified: boolean;
    }
}

export interface PostAttachment {
    key: string;
    url: string;
    name: string;
    mimeType: string;
    size: number;
    kind: "image" | "video" | "file";
}

export interface Short {
    id: string;
    url: string;
    description: string;
    createdAt: string | Date;
    author: {
        id: string;
        name: string;
        handle: string;
        image?: string;
        verified: boolean;
    }
}

export interface DMUserPreview {
    id: string;
    name: string;
    handle: string;
    image: string | null;
    verified: boolean;
    bio?: string | null;
}

export interface DMMessage {
    id: string;
    content: string;
    createdAt: string;
    updatedAt: string;
    senderId: string;
    sender: DMUserPreview;
}

export interface DMConversation {
    id: string;
    createdAt: string;
    updatedAt: string;
    lastMessageAt: string | null;
    unreadCount: number;
    participant: DMUserPreview | null;
    lastMessage: {
        id: string;
        content: string;
        createdAt: string;
        senderId: string;
    } | null;
}
