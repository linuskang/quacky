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

// Libraries
import Image from "next/image"
import { authClient } from "@/client/auth"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { redirect } from "next/navigation"
import { useRef, useState } from "react"
import Link from "next/link"

// Components
import { Settings, LogOut } from "lucide-react"

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
import { PrimaryTitle } from "./text"
import { User } from "@/types"

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
    const [open, setOpen] = useState(false)
    const [openCredits, setOpenCredits] = useState(false)
    const creditsOpenRef = useRef(false)
    const [saving, setSaving] = useState(false)

    const [name, setName] = useState("")
    const [image, setImage] = useState("")
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState("")
    const [username, setUsername] = useState("")
    const [privateAccount, setPrivateAccount] = useState(false)
    const [statsForNerds, setStatsForNerds] = useState(false)
    const imageInputRef = useRef<HTMLInputElement>(null)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [revokeOtherSessions, setRevokeOtherSessions] = useState(false)

    const handleOpenChange = (nextOpen: boolean) => {
        if (creditsOpenRef.current && !nextOpen) return
        setOpen(nextOpen)
        if (nextOpen && session?.user) {
            setName(session.user.name)
            setUsername(session.user.username)
            setPrivateAccount(session.user.private!)
            setStatsForNerds(session.user.statsForNerds!)
            setImage(session.user.image!)
            setImagePreview(session.user.image!)
            setImageFile(null)
        }
    }

    const handleCreditsOpenChange = (nextOpen: boolean) => {
        if (nextOpen) creditsOpenRef.current = true
        setOpenCredits(nextOpen)

        if (!nextOpen) {
            setTimeout(() => {
                creditsOpenRef.current = false
            }, 0)
        }
    }
    if (isPending) {
        return null
    }

    if (!session) {
        redirect("/auth/login")
    }

    const handleSave = async () => {
        setSaving(true)

        let nextImage = image

        if (imageFile) {
            try {
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
            } catch {
                toast.error("Failed to upload image")
                setSaving(false)
                return
            }
        }

        const user = session!.user

        const updates: Record<string, unknown> = {}
        if (name !== user.name) updates.name = name
        if (nextImage !== user.image) updates.image = nextImage
        if (username !== user.username) updates.username = username
        if (privateAccount !== user.private)
            updates.private = privateAccount
        if (statsForNerds !== user.statsForNerds)
            updates.statsForNerds = statsForNerds

        if (Object.keys(updates).length === 0) {
            setSaving(false)
            setOpen(false)
            return
        }

        await authClient.updateUser(updates, {
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
                            session.user.image!
                        }
                        alt={session.user.name}
                        width={36}
                        height={36}
                        unoptimized
                        className="rounded-full"
                    />

                    <div className="min-w-0">
                        <h2 className="truncate text-sm leading-none font-semibold text-primary">
                            {session.user.name}
                        </h2>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            @{session.user.username}
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
                                    General
                                </Label>
                                <div className="space-y-4">
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
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-sm font-semibold text-primary">
                                        Theme
                                    </Label>
                                    <ThemeToggle />
                                </div>

                                <div className="grid gap-4">
                                    <Label className="text-sm font-semibold text-primary">
                                        Profile
                                    </Label>
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
                                                    name || session.user.name || "User"
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
                                        Account
                                    </Label>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-primary">
                                            Email (cannot be changed)
                                        </Label>
                                        <Input
                                            type="email"
                                            value={session.user.email}
                                            className="h-10 border-2 border-border !text-sm !ring-0 hover:border-primary focus:border-primary"
                                            placeholder="Email"
                                            disabled
                                        />

                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-primary">
                                            Password
                                        </Label>
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
                            <div className="h-px w-full">
                                <Label className="text-sm font-semibold text-primary">
                                    Credits
                                </Label>

                                <Button
                                    variant="default"
                                    onClick={() => handleCreditsOpenChange(true)}
                                >
                                    View credits
                                </Button>
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

                    <Dialog
                        open={openCredits}
                        onOpenChange={handleCreditsOpenChange}
                    >
                        <DialogContent className="w-full !max-w-lg border-2 border-border bg-card p-6" showCloseButton={false}>
                            <DialogHeader>
                                <PrimaryTitle>
                                    Credits
                                </PrimaryTitle>
                            </DialogHeader>

                            <div className="space-y-2">
                                <h1 className="text-sm font-semibold text-primary">
                                    Creator
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Quacky is a project made by <Link href="https://github.com/linuskang" target="_blank" className="font-bold text-primary-2 hover:underline">
                                        Linus Kang
                                    </Link>
                                </p>
                                <h1 className="text-sm font-semibold text-primary">
                                    Art
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Quacky logo, background by{" "}
                                    <a
                                        href="https://sushii.is-a.dev/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-primary-2 hover:underline"
                                    >
                                        My Sister
                                    </a>
                                    .
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Goose assets by{" "}
                                    <a
                                        href="https://qaci.eq.edu.au/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-primary-2 hover:underline"
                                    >
                                        Queensland Academies for Creative Industries
                                    </a>
                                    {" "}(with permission).
                                </p>
                                <h1 className="text-sm font-semibold text-primary">
                                    AI Usage
                                </h1>
                                <div className="text-sm mt-2 text-muted-foreground">
                                    AI was primarily used in debugging, like when I had an error I didn&apos;t know how to fix, or when I needed help positioning UI:
                                    <ul className="list-disc list-inside ml-5 mt-2">
                                        <li>Debugging frontend code errors (i.e. Hydration Errors, UI Bugs, Things I didn&apos;t know how to do)</li>
                                        <li>Generating boilerplate example code for shadcn/ui (mostly React Hook Forms, and UI positioning as frontend is not my strong suite.) during prototyping.</li>
                                    </ul>
                                    <br />
                                    No AI was used for generating full scripts like component pages, instead, I used AI to assist with only debugging and boilerplate (prototyping, was removed after the testing app). All backend code including APIs was written by me without AI.
                                    <br />
                                    <br />
                                    Any application code that was made by AI was extensively modified by me for authenticity, if not completely rewritten.
                                    <br />
                                    <br />
                                    I also used AI to generate Unit & e2e tests for the backend, which you can find in /e2e and /tests. I did not modify these tests as they aren&apos;t used in the actual application, just helper scripts for me to test endpoints.
                                </div>
                            </div>


                            <p className="text-sm">
                                Quacky is licensed under the{" "}
                                <a
                                    href="https://creativecommons.org/licenses/by-nc/4.0/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-primary-2 hover:underline"
                                >
                                    CC BY-NC 4.0 license
                                </a>
                                .
                            </p>

                            <DialogClose asChild >
                                <Button
                                    className="mt-8 h-10 bg-card border-2 border-border hover:!bg-card hover:border-primary rounded-full px-5 text-lg text-primary font-semibold"
                                >
                                    Close
                                </Button>
                            </DialogClose>
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
