import { PageLayout, PageCenter } from "@/components/page-layout";

export default function Page() {
    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-3xl font-bold">Resources</h1>
                <p className="text-lg text-muted-foreground">
                    No resources at the moment. This is part of Stage 2 development. Stay tuned!
                </p>
            </PageCenter>
        </PageLayout>
    )
}