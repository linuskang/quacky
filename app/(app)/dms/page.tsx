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

// Libraries
import Link from "next/link"
import { requireSession } from "@/server/auth"
import { fetchConversations } from "@/server/dms"

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import { SearchBar } from "@/components/search-bar"
import { Avatar, AvatarImage } from "@/components/ui/avatar"
import { Title } from "@/components/text"
import { DmUserSearch } from "@/components/dm-user-search"
import Image from "next/image"
import { CurvedLine } from "@/components/line-generator"
import { patrickHand } from "@/lib/fonts"

export default async function MessagesPage() {
    const session = await requireSession()

    const conversations = await fetchConversations({
        userId: session.user.id,
    })

    return (
        <PageLayout>
            <PageCenter>
                <Title>Direct Messages</Title>

                <DmUserSearch />

                {conversations.length === 0 ? (
                    <div className="mt-10 flex flex-col items-center">
                        <div className="relative h-30 w-64">
                            <span
                                className={`${patrickHand.className} absolute top-2 right-0 text-right text-2xl font-bold`}
                            >
                                go dm someone!
                            </span>

                            <CurvedLine
                                from={{ x: 140, y: 120 }}
                                to={{ x: 200, y: 50 }}
                                strokeWidth={4}
                                wobble={-30}
                            />
                        </div>
                        <Image
                            src="/goose/Aquafest Whale 1.png"
                            alt="No messages"
                            width={200}
                            height={200}
                        />
                    </div>
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
    )
}
