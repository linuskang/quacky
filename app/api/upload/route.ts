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

import {
  getPublicObjectUrl,
  getStorageKey,
  uploadObject,
} from "@/server/storage"
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"

export async function POST(req: NextRequest) {
  const session = await getSession()

  if (!session) {
    return NextResponse.json(
      {
        err: "Unauthorized",
      },
      {
        status: 401,
      }
    )
  }

  const data = await req.formData()
  const file = data.get("file") as File // typesafety baby!

  if (!file) {
    return NextResponse.json(
      {
        err: "File is required",
      },
      {
        status: 400,
      }
    )
  }

  const key = getStorageKey(session.user.id, crypto.randomUUID())

  await uploadObject({
    key,
    body: Buffer.from(await file.arrayBuffer()),
    contentType: file.type,
  })

  return NextResponse.json({
    name: file.name,
    type: file.type,
    key,
    url: getPublicObjectUrl(key),
  })
}
