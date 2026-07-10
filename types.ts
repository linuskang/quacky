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

export type FullUser = {
    id: string;
    name: string;
    username: string;
    email: string;
    emailVerified?: boolean;
    image: string;
    verified: boolean;
    statsForNerds: boolean;
    private: boolean;
    streamerMode: boolean;
    hideTips: boolean;
    bio?: string | null;
    xp: number;
    points: number;
    bannerImage?: string | null;
    pronoun?: string | null;
    location?: string | null;
    website?: string | null;
    createdAt: string;
    updatedAt?: string;
    role: string | null;
    banned: boolean | null;
    banReason?: string | null;
    banExpires?: string | null;
};

export type User = {
    id?: string;
    name: string;
    username: string;
    image: string;
    verified: boolean;
    role?: string | null;
    following?: boolean;
};

export type Attachment = {
    name: string;
    url: string;
    type: string | null;
};

export type EmbeddedPost = {
    id: string;
    author: User;
    content: string;
    flagged: boolean;
    edited: boolean;
    createdAt: string;
    updatedAt: string;
    views: number;
    attachments?: Attachment[];
};

export type Post = {
    id: string;
    author: User;
    content: string;

    repostOfId: string | null;
    repostOf: EmbeddedPost | null;

    flagged: boolean;
    edited: boolean;
    createdAt: string;
    updatedAt: string;
    views: number;

    likes: number;
    comments: number;
    reposts: number;

    liked?: boolean;
    reposted?: boolean;
    bookmarked?: boolean;
    commented?: boolean;

    attachments?: Attachment[];
    postComments?: Comment[];
};

export type Notification = {
    id: string;
    user: User;
    actor: User | null;
    content: string;
    read: boolean;
    createdAt: string;
}

export type Like = {
    userId: string;
    postId: string;
    createdAt: string;
};

export type Comment = {
    id: string;
    postId: string;
    author: User;
    content: string;
    flagged: boolean;
    createdAt: string;
    updatedAt: string;
};

export type Follow = {
    userId: string;
    followId: string;
    createdAt: string;
};

export type Dm = {
    id: string;
    sender: User;
    receiver: User;
    message: string;
    read: boolean;
    createdAt: string;
};

export type Conversation = {
    user: User;
    lastMessage: string;
    lastMessageAt: string;
    unread: number;
};
