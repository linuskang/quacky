import { PageLayout, PageCenter, PageRight } from "@/components/page-layout";
import { prisma } from "@/server/prisma";

export default function Page() {
    return (
        <PageLayout>
            <PageCenter>
                <h1 className="text-2xl font-semibold">Notifications</h1>


            </PageCenter>
        </PageLayout>
    )
}