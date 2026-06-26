import { Sidebar } from "@/components/sidebar";
import { auth } from "@/server/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { PageLayout, PageLeft, PageCenter } from "@/components/page-layout";
import { Profile } from "@/components/profile";

export default async function QuackyLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    return (
        <PageLayout>
            <PageLeft>
                <Sidebar
                    session={{
                        user: {
                            handle: session.user.username,
                            image: session.user.image,
                        }
                    }}
                />

                <div className="mt-auto">
                    <Profile />
                </div>
            </PageLeft>

            <PageCenter>
                {children}
            </PageCenter>
        </PageLayout>
    );
}