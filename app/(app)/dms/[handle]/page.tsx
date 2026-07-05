import { notFound } from "next/navigation";
import { requireSession } from "@/server/auth";
import { prisma } from "@/server/prisma";
import { fetchMessages, markConversationRead } from "@/server/dms";
import { PageLayout, PageCenter } from "@/components/page-layout";
import { DmConversation } from "@/components/dm-conversation";

export default async function ConversationPage({
    params,
}: {
    params: Promise<{ handle: string }>;
}) {
    const session = await requireSession();
    const { handle } = await params;

    const other = await prisma.user.findUnique({
        where: { username: handle },
        select: {
            id: true,
            name: true,
            username: true,
            image: true,
            verified: true,
            role: true,
        },
    });

    if (!other) {
        notFound();
    }

    if (other.id === session.user.id) {
        notFound();
    }

    const [messages] = await Promise.all([
        fetchMessages({ userId: session.user.id, otherUserId: other.id }),
        markConversationRead({ userId: session.user.id, otherUserId: other.id }),
    ]);

    return (
        <PageLayout>
            <PageCenter>
                <DmConversation
                    other={other}
                    currentUserId={session.user.id}
                    initialMessages={messages}
                />
            </PageCenter>
        </PageLayout>
    );
}