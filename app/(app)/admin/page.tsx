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

"use client"

import axios from "axios"
import { PageLayout, PageCenter } from "@/components/page-layout"
import { useState, useSyncExternalStore } from "react"
import { Title, Description } from "@/components/text"
import { authClient } from "@/client/auth"
import { redirect } from "next/navigation"
import { toast } from "sonner"
import Loading from "../loading"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select"
import { AdminStats } from "@/components/admin-stats"

const subscribe = () => () => {}

export default function Page() {
    const { data: session, isPending } = authClient.useSession()
    const hydrated = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
    const [newUserName, setNewUserName] = useState("")
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserRole, setNewUserRole] = useState<"admin" | "user">("user")
    const [newUserUsername, setNewUserUsername] = useState("")
    const [creating, setCreating] = useState(false)

    if (!hydrated || isPending) return <Loading />

    if (!session) redirect("/auth/login")

    if (session.user.role !== "admin") {
        return (
            <PageLayout>
                <PageCenter>
                    <Title>Access Denied</Title>
                    <Description>
                        You do not have permission to access this page.
                    </Description>
                </PageCenter>
            </PageLayout>
        )
    }

    async function createUser() {
        setCreating(true)
        if (!newUserName || !newUserEmail || !newUserRole || !newUserUsername) {
            setCreating(false)
            return
        }

        try {
            const res = await axios.post("/api/admin/invite", {
                email: newUserEmail,
                role: newUserRole,
                displayName: newUserName,
                username: newUserUsername,
            })
            toast.success(
                "User created successfully. New password: " +
                    res.data.tempPassword
            )
        } catch {
            toast.error("Failed to create user.")
        } finally {
            setCreating(false)
        }
    }
    return (
        <PageLayout>
            <PageCenter className="max-w-6xl gap-6">
                <Title>Admin Panel</Title>

                <AdminStats />

                <Card>
                    <CardHeader>
                        <CardTitle>Invite a user</CardTitle>
                        <CardDescription>
                            The user will receive their username and temporary
                            password by email.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form
                            onSubmit={(event) => {
                                event.preventDefault()
                                void createUser()
                            }}
                            className="space-y-4"
                        >
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="display-name">
                                        Display name
                                    </Label>
                                    <Input
                                        id="display-name"
                                        value={newUserName}
                                        onChange={(event) =>
                                            setNewUserName(event.target.value)
                                        }
                                        placeholder="Jane Doe"
                                        autoComplete="name"
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        value={newUserUsername}
                                        onChange={(event) =>
                                            setNewUserUsername(
                                                event.target.value
                                            )
                                        }
                                        placeholder="janedoe"
                                        autoComplete="off"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(event) =>
                                        setNewUserEmail(event.target.value)
                                    }
                                    placeholder="jane@example.com"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="role">Role</Label>
                                <NativeSelect
                                    id="role"
                                    className="w-full"
                                    value={newUserRole}
                                    onChange={(event) =>
                                        setNewUserRole(
                                            event.target.value as
                                                "admin" | "user"
                                        )
                                    }
                                >
                                    <NativeSelectOption value="user">
                                        User
                                    </NativeSelectOption>
                                    <NativeSelectOption value="admin">
                                        Admin
                                    </NativeSelectOption>
                                </NativeSelect>
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={creating}
                            >
                                {creating
                                    ? "Sending invitation..."
                                    : "Send invitation"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </PageCenter>
        </PageLayout>
    )
}
