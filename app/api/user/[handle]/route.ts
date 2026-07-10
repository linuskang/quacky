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

import { prisma } from "@/server/prisma"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ handle: string }> }
) {
  const session = await auth.api.getSession({
    headers: req.headers,
  })

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { handle } = await params

  const user = await prisma.user.findUnique({
    where: {
      username: handle,
    },
    include: {
      following: {
        select: {
          follow: {
            select: {
              username: true,
            },
          },
        },
      },
      followers: {
        select: {
          user: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const following = user.following.map(({ follow }) => follow.username)
  const followers = user.followers.map(({ user }) => user.username)

  if (user.banned) {
    return NextResponse.json({
      id: user.id,
      name: user.name,
      username: user.username,
      banned: user.banned,
      following,
      followers,
    })
  }

  if (user.private) {
    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        username: user.username,
        image: user.image,
        bannerImage: user.bannerImage,
        createdAt: user.createdAt,
        verified: user.verified,
        private: user.private,
        role: user.role,
        banned: user.banned,
      },
      {
        status: 200,
      }
    )
  }

  return NextResponse.json(
    {
      id: user.id,
      name: user.name,
      username: user.username,
      image: user.image,
      createdAt: user.createdAt,
      verified: user.verified,
      private: user.private,
      xp: user.xp,
      points: user.points,
      role: user.role,
      bio: user.bio,
      website: user.website,
      location: user.location,
      bannerImage: user.bannerImage,
      pronouns: user.pronoun,
      banned: user.banned,
      following,
      followers,
    },
    {
      status: 200,
    }
  )
}
