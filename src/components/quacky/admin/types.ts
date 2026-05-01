export type UserSearchResult = {
    id: string;
    name: string;
    handle: string;
    email: string;
    image: string | null;
    verified: boolean;
    role: string | null;
    banned: boolean | null;
    privateAccount: boolean;
};

export type UserEditor = {
    id: string;
    name: string;
    handle: string;
    bio: string | null;
    image: string | null;
    email: string;
    role: string | null;
    verified: boolean;
    emailVerified: boolean;
    privateAccount: boolean;
    emailNotif: boolean;
    banned: boolean | null;
    banReason: string | null;
    banExpires: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    followers: number;
    following: number;
    postCount: number;
    replies: number;
    sessions: number;
};

export type PostSearchResult = {
    id: string;
    content: string;
    pinned: boolean;
    readOnly: boolean;
    isHidden: boolean;
    isDeleted: boolean;
    createdAt: string | Date;
    author: {
        id: string;
        name: string;
        handle: string;
        image: string | null;
        verified: boolean;
        role: string | null;
    };
    _count: {
        likes: number;
        replies: number;
    };
};


export type PostEditor = {
    id: string;
    type: string;
    content: string;
    attachmentsText: string;
    authorId: string;
    authorHandle: string;
    authorName: string;
    authorImage: string | null;
    authorVerified: boolean;
    authorRole: string | null;
    pinned: boolean;
    readOnly: boolean;
    isHidden: boolean;
    isDeleted: boolean;
    createdAt: string | Date;
    updatedAt: string | Date;
    editedAt: string | Date | null;
    likeCount: number;
    replyCount: number;
};
