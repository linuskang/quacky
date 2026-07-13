import { FileMarkdown } from "@/components/file-markdown";
import { PageLayout, PageCenter } from "@/components/page-layout";

export default function Page() {
    return (
        <PageLayout>
            <PageCenter>
                <FileMarkdown src="/devlog.md" />
            </PageCenter>
        </PageLayout>
    )
}
