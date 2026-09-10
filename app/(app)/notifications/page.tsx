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
import { requireSession } from "@/server/auth"
import { fetchNotifications } from "@/server/notifications"
import { prisma } from "@/server/prisma"

// Components
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import { SearchBar } from "@/components/search-bar"
import { Notifications } from "@/components/notification"
import { Title } from "@/components/text"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"

const PAGE_SIZE = 10

export default async function Page({
    searchParams,
}: {
    searchParams?: Promise<{ page?: string | string[] }>
}) {
    const session = await requireSession()
    const query = (await searchParams) ?? {}
    const requestedPage = Number(
        Array.isArray(query.page) ? query.page[0] : query.page
    )

    const totalNotifications = await prisma.notification.count({
        where: { userId: session.user.id },
    })
    const totalPages = Math.max(1, Math.ceil(totalNotifications / PAGE_SIZE))
    const page = Math.min(
        totalPages,
        Math.max(1, Number.isInteger(requestedPage) ? requestedPage : 1)
    )

    const [notifications] = await Promise.all([
        fetchNotifications({
            userId: session.user.id,
            page,
            pageSize: PAGE_SIZE,
        }),
        prisma.notification.updateMany({
            where: {
                userId: session.user.id,
                read: false,
            },
            data: {
                read: true,
            },
        }),
    ])

    return (
        <PageLayout>
            <PageCenter>
                <Title>Your Notifications</Title>
                {totalNotifications > PAGE_SIZE && (
                    <p className="-mt-2 text-sm font-semibold text-muted-foreground">
                        Page {page} of {totalPages}
                    </p>
                )}
                <Notifications notifications={notifications} />
                {totalNotifications > PAGE_SIZE && (
                    <Pagination>
                        <PaginationContent>
                            {page > 1 && (
                                <PaginationItem>
                                    <PaginationPrevious
                                        href={`/notifications?page=${page - 1}`}
                                    />
                                </PaginationItem>
                            )}
                            {page < totalPages && (
                                <PaginationItem>
                                    <PaginationNext
                                        href={`/notifications?page=${page + 1}`}
                                    />
                                </PaginationItem>
                            )}
                        </PaginationContent>
                    </Pagination>
                )}
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    )
}
