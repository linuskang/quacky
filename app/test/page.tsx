import { PageLayout, PageCenter, PageLeft, PageRight } from "@/components/page-layout";

export default function Page() {
    return (
        <PageLayout>
            <PageLeft>
                <h1 className="h-screen bg-card">hi</h1>
            </PageLeft>
            <PageRight>
                <h1 className="h-screen bg-card">hi</h1>
            </PageRight>
            <PageCenter>
                <h1 className="h-screen bg-card">hi</h1>
            </PageCenter>
        </PageLayout>
    )
}