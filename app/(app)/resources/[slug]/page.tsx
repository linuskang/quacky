import { notFound } from "next/navigation";

import { Resources } from "@/server/resources";
import { Markdown } from "@/components/markdown-renderer";

export default async function Page({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const { slug } = await params;

    const resource = await Resources.getResource(slug);

    if (!resource) {
        notFound();
    }

    return (
        <Markdown>{resource.content}</Markdown>
    );
}