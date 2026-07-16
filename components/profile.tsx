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

import Image from "next/image"
import { Settings, LogOut } from "lucide-react"
import { authClient } from "@/client/auth"

import { useRef, useState, useSyncExternalStore } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { playfairDisplay } from "@/app/layout"

import { Card } from "@/components/ui/card"

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const subscribe = () => () => {}

function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
                <Button
                    key={t}
                    type="button"
                    variant={theme === t ? "default" : "secondary"}
                    className="h-8 rounded-full border-2 border-border px-3 text-xs font-semibold capitalize"
                    onClick={() => setTheme(t)}
                >
                    {t}
                </Button>
            ))}
        </div>
    )
}

export function Profile() {
    const { data: session, isPending } = authClient.useSession()
    const hydrated = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
    const [open, setOpen] = useState(false)
    const [saving, setSaving] = useState(false)

    const [name, setName] = useState("")
    const [image, setImage] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState("")
    const [username, setUsername] = useState("")
    const [streamerMode, setStreamerMode] = useState(false)
    const [privateAccount, setPrivateAccount] = useState(false)
    const [statsForNerds, setStatsForNerds] = useState(false)
    const [hideTips, setHideTips] = useState(false)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [revokeOtherSessions, setRevokeOtherSessions] = useState(false)

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen)
        if (nextOpen && session?.user) {
            setName(session.user.name ?? "")
            setUsername(session.user.username)
            setStreamerMode(session.user.streamerMode ?? false)
            setPrivateAccount(session.user.private ?? false)
            setStatsForNerds(session.user.statsForNerds ?? false)
            setHideTips(session.user.hideTips ?? false)
            setImage(session.user.image ?? "")
            setImagePreview(session.user.image ?? "")
            setImageFile(null)
        }
    }

    if (!hydrated || isPending || !session) {
        return (
            <Card className="h-15 w-full border-2 border-border">
                <div className="flex h-full items-center justify-between px-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
                        <div className="min-w-0 space-y-1.5">
                            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                            <div className="h-2.5 w-14 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                </div>
            </Card>
        )
    }

    const user = session.user

    const handleSave = async () => {
        setSaving(true)

        let nextImage = image

        if (imageFile) {
            const formData = new FormData()
            formData.append("file", imageFile)

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            })

            const upload = await uploadRes.json()

            nextImage = upload.url
            setImage(nextImage)
            setImagePreview(nextImage)
        }

        const payload: Record<string, unknown> = {}
        if (name !== user.name) payload.name = name
        if (nextImage !== user.image) payload.image = nextImage
        if (username !== user.username) payload.username = username
        if (streamerMode !== user.streamerMode)
            payload.streamerMode = streamerMode
        if (privateAccount !== user.private) payload.private = privateAccount
        if (statsForNerds !== user.statsForNerds)
            payload.statsForNerds = statsForNerds
        if (hideTips !== user.hideTips) payload.hideTips = hideTips

        if (Object.keys(payload).length === 0) {
            setSaving(false)
            setOpen(false)
            return
        }

        await authClient.updateUser(payload, {
            onSuccess: () => {
                setSaving(false)
                setOpen(false)
                toast.success("Settings updated successfully")
            },
            onError: (ctx) => {
                setSaving(false)
                toast.error(ctx.error.message)
            },
        })
    }

    async function changePassword() {
        const { error } = await authClient.changePassword({
            newPassword: newPassword,
            currentPassword: currentPassword,
            revokeOtherSessions: revokeOtherSessions,
        })

        if (error) {
            toast.error(error.message || "Failed to change password")
        } else {
            toast.success("Password changed successfully")
            setCurrentPassword("")
            setNewPassword("")
        }
    }

    return (
        <Card className="h-15 w-full border-2 border-border">
            <div className="flex h-full items-center justify-between px-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Image
                        src={
                            user.image ||
                            `https://api.dicebear.com/9.x/glass/svg?seed=${user.username}`
                        }
                        alt={user.name ?? "User"}
                        width={36}
                        height={36}
                        unoptimized
                        className="rounded-full"
                    />

                    <div className="min-w-0">
                        <h2 className="truncate text-sm leading-none font-semibold text-primary">
                            {user.name}
                        </h2>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            @{user.username}
                        </p>
                    </div>
                </div>

                <div className="-mr-1 flex items-center gap-0">
                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <button
                                aria-label="Settings"
                                className="flex h-8 w-8 items-center justify-center"
                            >
                                <Settings
                                    className="h-5 w-5 text-primary"
                                    strokeWidth={3}
                                />
                            </button>
                        </DialogTrigger>

                        <DialogContent
                            className="w-full !max-w-lg border-2 border-border bg-card p-6"
                            showCloseButton={false}
                        >
                            <DialogHeader>
                                <DialogTitle
                                    className={`text-4xl font-semibold ${playfairDisplay.className} text-primary`}
                                    style={{ fontStyle: "italic" }}
                                >
                                    Settings
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-primary">
                                    General Settings
                                </Label>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="streamer-mode"
                                            className="mt-1 border-2"
                                            checked={streamerMode}
                                            onCheckedChange={(checked) =>
                                                setStreamerMode(
                                                    checked === true
                                                )
                                            }
                                        />
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="streamer-mode"
                                                className="text-sm font-semibold text-primary"
                                            >
                                                Streamer Mode
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Blurs sensitive information like
                                                your email, among others.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="private-account"
                                            className="mt-1 border-2"
                                            checked={privateAccount}
                                            onCheckedChange={(checked) =>
                                                setPrivateAccount(
                                                    checked === true
                                                )
                                            }
                                        />
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="private-account"
                                                className="text-sm font-semibold text-primary"
                                            >
                                                Private Account
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Makes your account private, only
                                                you can see your profile.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="stats-nerds"
                                            className="mt-1 border-2"
                                            checked={statsForNerds}
                                            onCheckedChange={(checked) =>
                                                setStatsForNerds(
                                                    checked === true
                                                )
                                            }
                                        />
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="stats-nerds"
                                                className="text-sm font-semibold text-primary"
                                            >
                                                Stats for Nerds
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Some developer stats on pages.
                                                Useful for debugging.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="hide-tips"
                                            className="mt-1 border-2"
                                            checked={hideTips}
                                            onCheckedChange={(checked) =>
                                                setHideTips(checked === true)
                                            }
                                        />
                                        <div className="space-y-0.5">
                                            <Label
                                                htmlFor="hide-tips"
                                                className="text-sm font-semibold text-primary"
                                            >
                                                Hide Tips
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Hides tips on pages.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-primary">
                                        App Theme
                                    </Label>
                                    <ThemeToggle />
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="name"
                                            className="font-semibold text-primary"
                                        >
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            className="h-10 border-2 border-border !text-sm !ring-0 hover:border-primary focus:border-primary"
                                            placeholder="Name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="font-semibold text-primary">
                                            Profile Image
                                        </Label>
                                        <div className="flex items-center gap-3">
                                            <Image
                                                src={imagePreview}
                                                alt={
                                                    name || user.name || "User"
                                                }
                                                width={56}
                                                height={56}
                                                unoptimized
                                                className="h-14 w-14 rounded-full object-cover"
                                            />
                                            <div className="space-y-1">
                                                <input
                                                    ref={imageInputRef}
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file =
                                                            e.target
                                                                .files?.[0] ??
                                                            null
                                                        setImageFile(file)

                                                        if (file) {
                                                            setImagePreview(
                                                                URL.createObjectURL(
                                                                    file
                                                                )
                                                            )
                                                        }
                                                    }}
                                                />
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    className="h-9 rounded-full border-2 border-border bg-card px-4 font-semibold hover:border-primary"
                                                    onClick={() =>
                                                        imageInputRef.current?.click()
                                                    }
                                                >
                                                    Upload Image
                                                </Button>
                                                {imageFile && (
                                                    <p className="max-w-64 truncate text-xs text-muted-foreground">
                                                        {imageFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="username"
                                            className="font-semibold text-primary"
                                        >
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            value={username}
                                            onChange={(e) =>
                                                setUsername(e.target.value)
                                            }
                                            className="h-10 border-2 border-border !text-sm !ring-0 hover:border-primary focus:border-primary"
                                            placeholder="Username"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-primary">
                                        Change Password
                                    </Label>
                                    <div className="space-y-2">
                                        <Input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) =>
                                                setCurrentPassword(
                                                    e.target.value
                                                )
                                            }
                                            className="h-10 border-2 border-border !text-sm !ring-0 hover:border-primary focus:border-primary"
                                            placeholder="Current Password"
                                        />
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) =>
                                                setNewPassword(e.target.value)
                                            }
                                            className="h-10 border-2 border-border !text-sm !ring-0 hover:border-primary focus:border-primary"
                                            placeholder="New Password"
                                        />
                                        <div className="flex items-center gap-3">
                                            <Checkbox
                                                id="revoke-sessions"
                                                className="mt-1 border-2"
                                                checked={revokeOtherSessions}
                                                onCheckedChange={(checked) =>
                                                    setRevokeOtherSessions(
                                                        checked === true
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="revoke-sessions"
                                                className="text-sm font-semibold text-primary"
                                            >
                                                Revoke Other Sessions
                                            </Label>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            className="h-10 rounded-full border-2 border-border bg-card px-5 text-base font-semibold hover:border-primary"
                                            onClick={changePassword}
                                        >
                                            Change Password
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        className="h-10 rounded-full border-2 border-border bg-card px-5 text-base font-semibold hover:border-primary"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="default"
                                    className="h-10 rounded-full bg-primary-2 px-5 text-base font-semibold text-background"
                                    onClick={handleSave}
                                    disabled={saving}
                                >
                                    {saving ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    <button
                        aria-label="Log out"
                        className="flex h-8 w-8 items-center justify-center text-primary"
                        onClick={async () => {
                            await authClient.signOut()
                            window.location.reload()
                        }}
                    >
                        <LogOut className="h-5 w-5" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </Card>
    )
}
