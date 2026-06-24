"use client"
import { Button } from "@/components/ui/button"
import { authClient } from "@/client/auth"
import { redirect } from "next/navigation"
export default function Page() {

    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="flex min-h-svh items-center justify-center">
                <div className="animate-pulse rounded-md bg-muted p-4">
                    Loading session...
                </div>
            </div>
        )
    }

    if (!session) {

        redirect("/auth/login");
    }
    return (
        <div className="flex min-h-svh p-6">
            <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                <div>
                    <h1 className="font-medium">Welcome, {session.user.name}</h1>
                    <p>Username: {session.user.username}</p>
                    <p>Email: {session.user.email}</p>
                    <Button className="mt-2" onClick={() => authClient.signOut()}>
                        Sign out
                    </Button>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                    (Press <kbd>d</kbd> to toggle dark mode)
                </div>
            </div>
        </div>
    )
}
