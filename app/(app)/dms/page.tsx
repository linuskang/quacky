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

import Link from "next/link";
import { MessagesSquare } from "lucide-react";
import { requireSession } from "@/server/auth";
import { fetchConversations } from "@/server/dms";
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { SearchBar } from "@/components/search-bar";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Title } from "@/components/text";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";

export default async function MessagesPage() {
    const session = await requireSession();
    const conversations = await fetchConversations({
        userId: session.user.id,
    });

    return (
        <PageLayout>
            <PageCenter>
                <Title>Direct Messages</Title>

                {conversations.length === 0 ? (
                    <Empty className="mt-8">
                        <EmptyContent>
                            <EmptyMedia>
                                <MessagesSquare className="size-8 text-muted-foreground" />
                            </EmptyMedia>
                            <EmptyTitle>No conversations yet</EmptyTitle>
                            <EmptyDescription>
                                DM someone from their profile to start a conversation.
                            </EmptyDescription>
                        </EmptyContent>
                    </Empty>
                ) : (
                    <ul className="flex flex-col gap-1">
                        {conversations.map((convo) => (
                            <li key={convo.user.username}>
                                <Link
                                    href={`/dms/${convo.user.username}`}
                                    className="flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-card"
                                >
                                    <Avatar className="h-11 w-11 shrink-0">
                                        <AvatarImage src={convo.user.image} />
                                    </Avatar>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate font-semibold">
                                                {convo.user.name}
                                            </span>
                                            <span className="shrink-0 text-xs text-muted-foreground">
                                                {new Date(
                                                    convo.lastMessageAt
                                                ).toLocaleString("en-US", {
                                                    hour: "numeric",
                                                    minute: "numeric",
                                                    month: "short",
                                                    day: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {convo.lastMessage}
                                        </p>
                                    </div>

                                    {convo.unread > 0 && (
                                        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary-2 px-1.5 text-xs font-bold text-primary-foreground">
                                            {convo.unread}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </PageCenter>

            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    );
}