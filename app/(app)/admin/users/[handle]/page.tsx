"use client"

import axios from "axios"
import * as React from "react"
import { type ChangeEvent } from "react"
import { type FieldPath } from "react-hook-form"
import { useParams } from "next/navigation"
import { toast } from "sonner"

import { authClient } from "@/client/auth"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type User = {
    id: string
    name: string
    username: string
    email: string
    emailVerified: boolean
    image: string
    verified: boolean
    statsForNerds: boolean
    private: boolean
    streamerMode: boolean
    hideTips: boolean
    bio: string | null
    bannerImage: string | null
    pronoun: string | null
    location: string | null
    website: string | null
    createdAt: string
    updatedAt: string
    role: string | null
    banned: boolean | null
    banReason: string | null
    banExpires: string | null
    parentEmail: string | null
    unlockedPosting: boolean
    unlockedCommenting: boolean
    unlockedDms: boolean
    unlockedFuzzies: boolean
    unlockedProfiles: boolean
    xp: number
    points: number
    pushNotificationsEnabled: boolean
}

type UserFormValues = Omit<User, "id" | "createdAt" | "updatedAt" | "banExpires"> & {
    banExpires: string
}

const labelClassName = "flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none"
const errorClassName = "text-xs/relaxed text-destructive"

function toDateInput(value: string | null) {
    return value ? new Date(value).toISOString().slice(0, 16) : ""
}

function toFormValues(user: User): UserFormValues {
    return {
        name: user.name,
        username: user.username,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        verified: user.verified,
        statsForNerds: user.statsForNerds,
        private: user.private,
        streamerMode: user.streamerMode,
        hideTips: user.hideTips,
        bio: user.bio ?? "",
        bannerImage: user.bannerImage ?? "",
        pronoun: user.pronoun ?? "",
        location: user.location ?? "",
        website: user.website ?? "",
        role: user.role ?? "",
        banned: user.banned ?? false,
        banReason: user.banReason ?? "",
        banExpires: toDateInput(user.banExpires),
        parentEmail: user.parentEmail ?? "",
        unlockedPosting: user.unlockedPosting,
        unlockedCommenting: user.unlockedCommenting,
        unlockedDms: user.unlockedDms,
        unlockedFuzzies: user.unlockedFuzzies,
        unlockedProfiles: user.unlockedProfiles,
        xp: user.xp,
        points: user.points,
        pushNotificationsEnabled: user.pushNotificationsEnabled,
    }
}

function TextField({
    name,
    label,
    type = "text",
}: {
    name: FieldPath<UserFormValues>
    label: string
    type?: React.ComponentProps<typeof Input>["type"]
}) {
    return (
        <div className="grid gap-2">
            <Form.Label name={name} className={labelClassName}>{label}</Form.Label>
            <Form.Field name={name}>
                <Input type={type} />
            </Form.Field>
            <Form.Error name={name} className={errorClassName} />
        </div>
    )
}

function NumberField({ name, label }: { name: "xp" | "points"; label: string }) {
    return (
        <div className="grid gap-2">
            <Form.Label name={name} className={labelClassName}>{label}</Form.Label>
            <Form.Field
                name={name}
                override={({ field }) => ({
                    onBlur: field.onBlur,
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(event.currentTarget.valueAsNumber),
                    value: field.value ?? "",
                })}
            >
                <Input type="number" min="0" step="1" />
            </Form.Field>
            <Form.Error name={name} className={errorClassName} />
        </div>
    )
}

function BooleanField({ name, label }: { name: FieldPath<UserFormValues>; label: string }) {
    return (
        <Form.Label name={name} className={labelClassName}>
            <Form.Field
                name={name}
                override={({ field }) => ({
                    checked: Boolean(field.value),
                    onCheckedChange: field.onChange,
                })}
            >
                <Checkbox />
            </Form.Field>
            {label}
        </Form.Label>
    )
}

function UserForm({ user, onSaved }: { user: User; onSaved: (user: User) => void }) {
    async function submit(values: UserFormValues) {
        try {
            const response = await axios.patch(`/api/admin/users/${encodeURIComponent(user.username)}`, values)
            onSaved(response.data.data)
            toast.success("User updated")
        } catch {
            toast.error("Unable to update user")
        }
    }

    return (
        <Form<UserFormValues>
            className="grid gap-6"
            formOptions={{ defaultValues: toFormValues(user) }}
            onSubmit={submit}
        >
            <section className="grid gap-3">
                <h2 className="text-lg font-bold">Identity</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    <TextField name="name" label="Name" />
                    <TextField name="username" label="Username" />
                    <TextField name="email" label="Email" type="email" />
                    <TextField name="image" label="Profile image URL" type="url" />
                    <TextField name="bannerImage" label="Banner image URL" type="url" />
                    <TextField name="pronoun" label="Pronoun" />
                    <TextField name="location" label="Location" />
                    <TextField name="website" label="Website" type="url" />
                </div>
                <TextField name="bio" label="Bio" />
            </section>

            <section className="grid gap-3">
                <h2 className="text-lg font-bold">Account</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    <TextField name="role" label="Role" />
                    <TextField name="parentEmail" label="Parent email" type="email" />
                    <TextField name="banReason" label="Ban reason" />
                    <TextField name="banExpires" label="Ban expires" type="datetime-local" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <BooleanField name="emailVerified" label="Email verified" />
                    <BooleanField name="verified" label="Verified" />
                    <BooleanField name="banned" label="Banned" />
                    <BooleanField name="private" label="Private account" />
                    <BooleanField name="statsForNerds" label="Stats for nerds" />
                    <BooleanField name="streamerMode" label="Streamer mode" />
                    <BooleanField name="hideTips" label="Hide tips" />
                    <BooleanField name="pushNotificationsEnabled" label="Push notifications" />
                </div>
            </section>

            <section className="grid gap-3">
                <h2 className="text-lg font-bold">Progress and permissions</h2>
                <div className="grid gap-3 md:grid-cols-2">
                    <NumberField name="xp" label="XP" />
                    <NumberField name="points" label="Points" />
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <BooleanField name="unlockedPosting" label="Posting unlocked" />
                    <BooleanField name="unlockedCommenting" label="Commenting unlocked" />
                    <BooleanField name="unlockedDms" label="Direct messages unlocked" />
                    <BooleanField name="unlockedFuzzies" label="Fuzzies unlocked" />
                    <BooleanField name="unlockedProfiles" label="Profiles unlocked" />
                </div>
            </section>

            <section className="grid gap-2">
                <h2 className="text-lg font-bold">System metadata</h2>
                <p className="text-sm text-muted-foreground">ID: {user.id}</p>
                <p className="text-sm text-muted-foreground">Created: {new Date(user.createdAt).toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Last updated: {new Date(user.updatedAt).toLocaleString()}</p>
            </section>

            <Form.Submit>
                {({ isLoading }) => (
                    <Button type="submit" disabled={isLoading} className="w-fit">
                        {isLoading ? "Saving..." : "Save changes"}
                    </Button>
                )}
            </Form.Submit>
        </Form>
    )
}

export default function Page() {
    const params = useParams<{ handle: string }>()
    const { data: session } = authClient.useSession()
    const [user, setUser] = React.useState<User | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        if (!session || !params.handle) return

        axios.get(`/api/admin/users/${encodeURIComponent(params.handle)}`)
            .then((response) => setUser(response.data.data))
            .catch(() => toast.error("Unable to load user"))
            .finally(() => setLoading(false))
    }, [params.handle, session])

    if (!session) return null
    if (loading) return <p>Loading user...</p>
    if (!user) return <p>User not found.</p>

    return (
        <Card className="p-5">
            <h1 className="mb-6 text-2xl font-extrabold">Edit @{user.username}</h1>
            <UserForm key={user.updatedAt} user={user} onSaved={setUser} />
        </Card>
    )
}
