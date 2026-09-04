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

import fs from "fs/promises"
import path from "path"
import matter from "gray-matter"

import { prisma } from "@/server/prisma"

export type Resource = {
    slug: string
    name: string
    description: string
    readTime: number
    date: string
    author: {
        name: string
        username: string
        image: string
    } | null
}

export type ResourcePage = Resource & {
    content: string
}

export class Resources {
    private static root = path.join(process.cwd(), "public", "resources")

    static async getResources(): Promise<Resource[]> {
        async function walk(dir: string): Promise<Resource[]> {
            const entries = await fs.readdir(dir, { withFileTypes: true })

            const resources = await Promise.all(
                entries.map(async (entry) => {
                    const fullPath = path.join(dir, entry.name)

                    if (entry.isDirectory()) {
                        return walk(fullPath)
                    }

                    if (!entry.isFile() || !entry.name.endsWith(".md")) {
                        return []
                    }

                    const file = await fs.readFile(fullPath, "utf8")
                    const { data } = matter(file)

                    const author = await prisma.user.findUnique({
                        where: {
                            username: data.author,
                        },
                        select: {
                            name: true,
                            username: true,
                            image: true,
                        },
                    })

                    return [
                        {
                            slug: path
                                .relative(Resources.root, fullPath)
                                .replace(/\\/g, "/")
                                .replace(/\.md$/, ""),
                            name: data.name,
                            description: data.description,
                            readTime: Number(data.readTime),
                            date: data.date,
                            author,
                        },
                    ]
                })
            )

            return resources.flat()
        }

        return walk(this.root)
    }

    static async getResource(slug: string): Promise<ResourcePage | null> {
        const filePath = path.join(this.root, `${slug}.md`)

        try {
            const file = await fs.readFile(filePath, "utf8")
            const { data, content } = matter(file)

            const author = await prisma.user.findUnique({
                where: {
                    username: data.author,
                },
                select: {
                    name: true,
                    username: true,
                    image: true,
                },
            })

            return {
                slug,
                name: data.name,
                description: data.description,
                readTime: Number(data.readTime),
                date: data.date,
                author,
                content,
            }
        } catch {
            return null
        }
    }
}
