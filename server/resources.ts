import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";

export type Resource = {
    slug: string;
    name: string;
    description: string;
    readTime: number;
    date: string;
    author: string;
};

export type ResourcePage = Resource & {
    content: string;
};

export class Resources {
    private static root = path.join(process.cwd(), "public", "resources");

    static async getResources(): Promise<Resource[]> {
        async function walk(dir: string): Promise<Resource[]> {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            const resources = await Promise.all(
                entries.map(async (entry) => {
                    const fullPath = path.join(dir, entry.name);

                    if (entry.isDirectory()) {
                        return walk(fullPath);
                    }

                    if (!entry.isFile() || !entry.name.endsWith(".md")) {
                        return [];
                    }

                    const file = await fs.readFile(fullPath, "utf8");
                    const { data } = matter(file);

                    return [{
                        slug: path
                            .relative(Resources.root, fullPath)
                            .replace(/\\/g, "/")
                            .replace(/\.md$/, ""),
                        name: data.name,
                        description: data.description,
                        readTime: Number(data.readTime),
                        date: data.date,
                        author: data.author,
                    }];
                })
            );

            return resources.flat();
        }

        return walk(this.root);
    }

    static async getResource(slug: string): Promise<ResourcePage | null> {
        const filePath = path.join(this.root, `${slug}.md`);

        try {
            const file = await fs.readFile(filePath, "utf8");
            const { data, content } = matter(file);

            return {
                slug,
                name: data.name,
                description: data.description,
                readTime: Number(data.readTime),
                date: data.date,
                author: data.author,
                content,
            };
        } catch {
            return null;
        }
    }
}