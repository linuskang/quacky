import { FileMarkdown } from "@/components/file-markdown"
import { PageLayout, PageCenter } from "@/components/page-layout"

export default async function Page() {
    return (
        <PageLayout>
            <PageCenter>
                <FileMarkdown src="/legal/privacy.md" />
            </PageCenter>
        </PageLayout>
    )
}
