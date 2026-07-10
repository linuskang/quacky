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

"use client"

import Image from "next/image"
import { useTimeAgo } from "@/client/utils"

// Types
import { Notification } from "@/types"
import Link from "next/link"
import { BadgeCheck } from "lucide-react"
import { Admin } from "./icons"
import { Markdown } from "./markdown-renderer"

export function Notifications({
  notifications,
}: {
  notifications: Notification[]
}) {
  return (
    <div className="flex flex-col gap-2">
      {notifications.map((notification) => (
        <NotificationCard key={notification.id} notification={notification} />
      ))}
    </div>
  )
}

export function NotificationCard({
  notification,
}: {
  notification: Notification
}) {
  const timeAgo = useTimeAgo(notification.createdAt)
  const actor = notification.actor

  return (
    <div className="w-full max-w-lg min-w-0 overflow-hidden rounded-md border-2 border-border !bg-card-primary p-3">
      <div className="flex gap-2">
        <div className="shrink-0">
          <Image
            src={actor?.image ?? "/default-avatar.png"}
            alt={actor?.name ?? "Deleted user"}
            width={28}
            height={28}
            unoptimized
            className="rounded-full"
          />
        </div>

        <div className="mb-0 flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-start justify-between">
            <div className="flex min-w-0 flex-wrap items-center gap-1">
              {actor ? (
                <Link
                  href={`/@${actor.username}`}
                  className="font-semibold text-primary hover:underline"
                >
                  {actor.name}
                </Link>
              ) : (
                <span className="font-semibold text-primary">Deleted user</span>
              )}

              {actor?.verified && (
                <BadgeCheck className="h-5 w-5 shrink-0 fill-primary text-background" />
              )}

              {actor?.role === "admin" && <Admin />}

              {actor && (
                <Link
                  href={`/@${actor.username}`}
                  onClick={(event) => event.stopPropagation()}
                  className="text-sm font-semibold text-muted-foreground hover:underline"
                >
                  @{actor.username}
                </Link>
              )}

              {timeAgo && (
                <span className="text-sm text-muted-foreground">
                  · {timeAgo}
                </span>
              )}
            </div>
          </div>
          <Markdown>{notification.content}</Markdown>
        </div>
      </div>
    </div>
  )
}
