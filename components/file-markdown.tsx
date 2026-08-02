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

import { readFile } from "node:fs/promises"
import { notFound } from "next/navigation"
import path from "node:path"
import { Markdown } from "@/components/markdown-renderer"

export async function FileMarkdown({ src }: { src: string }) {
    const publicDir = path.resolve(process.cwd(), "public")
    const filePath = path.resolve(publicDir, src.replace(/^\/+/, ""))

    if (
        filePath !== publicDir &&
        !filePath.startsWith(`${publicDir}${path.sep}`)
    ) {
        notFound()
    }

    let markdown: string

    try {
        markdown = await readFile(filePath, "utf8")
    } catch {
        notFound()
    }

    return <Markdown imageDisplay="full">{markdown}</Markdown>
}
