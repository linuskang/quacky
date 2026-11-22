"use client"

import { authClient } from '@/client/auth'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import * as React from 'react'
import { toast } from 'sonner'
import Loading from "@/components/loading"
import Image from "next/image"
import Link from "next/link"
import { trpc } from "@/lib/trpc"

export default function Page() {
    const { data: session } = authClient.useSession()
    const [query, setQuery] = React.useState("")
    const {
        data: users = [],
        isLoading: loading,
        isError,
    } = trpc.admin.usersList.useQuery(undefined, { enabled: Boolean(session) })

    React.useEffect(() => {
        if (isError) {
            toast.error("somethign went wrong")
        }
    }, [isError])

    function queryUsers() {
        return users.filter((user) => {
            const search = query.toLowerCase().trim()

            if (!search) return true

            return (
                user.name?.toLowerCase().includes(search) ||
                user.username?.toLowerCase().includes(search) ||
                user.email?.toLowerCase().includes(search) ||
                user.role?.toLowerCase().includes(search)
            )
        })
    }

    if (!session) return null

    return (
        <div>
            {loading && <Loading />}
            <Input
                placeholder="query users..."
                className="mb-4"
                onChange={(e) => {
                    setQuery(e.target.value)
                }}
            />
            {queryUsers().map((user) => (
                <Link key={user.id} href={`/admin/users/${user.username}`}>
                    <Card key={user.id} className="mb-1 p-0">
                        <div className="p-4">
                            <Image src={user.image} alt={user.name} width={50} height={50} className="rounded-full" />
                            <h2 className="text-lg font-bold">
                                {user.name}{" "}
                                {user.verified ? "(Verified)" : ""}
                                {user.role?.toLowerCase() === "admin" ? " (Admin)" : ""}
                                {user.role?.toLowerCase() === "bot" ? " (Bot)" : ""}
                            </h2>

                            <p className="text-sm text-muted-foreground">
                                {user.email}
                            </p>

                            <p className="text-sm text-muted-foreground">
                                @{user.username}
                            </p>

                            <p className="text-sm text-muted-foreground italic">
                                Joined {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </Card>
                </Link>
            ))}
        </div>
    )
}
