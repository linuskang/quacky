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

import { getSession } from "@/server/auth"
import { hasCheckedIn, checkIn } from "@/server/check-in"
import { NextRequest, NextResponse } from "next/server"
import { Up } from "@/server/upstream"
import { env } from "@/env"
import { xp } from "@/lib/var"
import { addXP } from "@/server/users"

interface CheckInProps {
  wellbeing: number
  happiness: number
  stress: number
  sleep: number
  energy: number
  assistance: boolean
}
export async function POST(req: NextRequest) {
  const session = await getSession()

  if (!session) {
    return new NextResponse("Unauthorized", {
      status: 401,
    })
  }

  const hasCheckedInToday = await hasCheckedIn(session.user.id)

  if (hasCheckedInToday) {
    return new NextResponse("You have already checked in today", {
      status: 403,
    })
  }

  const body = (await req.json()) as CheckInProps

  const res = await checkIn({
    userId: session.user.id,
    date: new Date(),
    wellbeing: body.wellbeing,
    happiness: body.happiness,
    stress: body.stress,
    sleep: body.sleep,
    energy: body.energy,
    assistance: body.assistance,
  })

  await addXP(session.user.username, xp.checkIn)

  if (res.assistance) {
    await Up.ingest({
      title: "Student requested a talk with a staff member",
      icon: "🛫",
      fields: [
        {
          name: "Name",
          value: session.user.name,
        },
        {
          name: "Email",
          value: session.user.email,
        },
      ],
      actions: [
        {
          title: "Send Email",
          url: `mailto:${session.user.email}?subject=Student%20Check-In%20Assistance&body=Hello%20${session.user.name},`,
          type: "default",
        },
        {
          title: "View in Quacky",
          url: `${env.BETTER_AUTH_URL}/@${session.user.username}`,
          type: "secondary",
        },
      ],
    })
  }

  return NextResponse.json(res, { status: 201 })
}
