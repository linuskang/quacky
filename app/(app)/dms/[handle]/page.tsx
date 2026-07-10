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
import { notFound } from "next/navigation"
import { requireSession } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { fetchMessages, markConversationRead } from "@/server/dms"

// Components
import { PageLayout, PageCenter } from "@/components/page-layout"
import { Dm } from "@/components/dm"

export default async function Page({
  params,
}: {
  params: Promise<{ handle: string }>
}) {
  const session = await requireSession()
  const { handle } = await params

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
  })

  if (!other) {
    notFound()
  }

  if (other.id === session.user.id) {
    notFound()
  }

  const [messages] = await Promise.all([
    fetchMessages({ userId: session.user.id, otherUserId: other.id }),
    markConversationRead({ userId: session.user.id, otherUserId: other.id }),
  ])

  return (
    <PageLayout>
      <PageCenter>
        <Dm
          other={other}
          currentUserId={session.user.id}
          initialMessages={messages}
        />
      </PageCenter>
    </PageLayout>
  )
}
