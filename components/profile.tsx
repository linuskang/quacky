"use client";

import Image from "next/image";
import { Settings, LogOut } from "lucide-react";
import { authClient } from "@/client/auth";

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

import { playfairDisplay } from "@/app/layout";

import {
    Card,
} from "@/components/ui/card";

import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

function ThemeToggle() {
    const { theme, setTheme } = useTheme()

    return (
        <div className="flex gap-2">
            {(["light", "dark", "system"] as const).map((t) => (
                <Button
                    key={t}
                    type="button"
                    variant={theme === t ? "default" : "secondary"}
                    className="h-8 px-3 rounded-full border-2 border-border text-xs font-semibold capitalize"
                    onClick={() => setTheme(t)}
                >
                    {t}
                </Button>
            ))}
        </div>
    )
}

export function Profile() {
    const { data: session, isPending } = authClient.useSession();
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [streamerMode, setStreamerMode] = useState(false);
    const [privateAccount, setPrivateAccount] = useState(false);
    const [statsForNerds, setStatsForNerds] = useState(false);
    const [hideTips, setHideTips] = useState(false);

    const handleOpenChange = (nextOpen: boolean) => {
        setOpen(nextOpen);
        if (nextOpen && session?.user) {
            setName(session.user.name ?? "");
            setUsername(session.user.username ?? "");
            setStreamerMode(session.user.streamerMode ?? false);
            setPrivateAccount(session.user.private ?? false);
            setStatsForNerds(session.user.statsForNerds ?? false);
            setHideTips(session.user.hideTips ?? false);
        }
    };

    if (isPending || !session) {
        return (
            <Card className="w-full h-15 border-2 border-border">
                <div className="flex h-full items-center justify-between px-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-muted animate-pulse" />
                        <div className="min-w-0 space-y-1.5">
                            <div className="h-3 w-20 rounded bg-muted animate-pulse" />
                            <div className="h-2.5 w-14 rounded bg-muted animate-pulse" />
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    const user = session.user;

    const handleSave = async () => {
        const payload: Record<string, unknown> = {};
        if (name !== user.name) payload.name = name;
        if (username !== user.username) payload.username = username;
        if (streamerMode !== user.streamerMode) payload.streamerMode = streamerMode;
        if (privateAccount !== user.private) payload.private = privateAccount;
        if (statsForNerds !== user.statsForNerds) payload.statsForNerds = statsForNerds;
        if (hideTips !== user.hideTips) payload.hideTips = hideTips;

        if (Object.keys(payload).length === 0) {
            setOpen(false);
            return;
        }

        await authClient.updateUser(
            payload,
            {
                onRequest: () => setSaving(true),
                onSuccess: () => {
                    setSaving(false);
                    setOpen(false);
                    toast.success("Settings updated successfully");
                },
                onError: (ctx) => {
                    setSaving(false);
                    toast.error(ctx.error.message);
                },
            }
        );
    };

    return (
        <Card className="w-full h-15 border-2 border-border">
            <div className="flex h-full items-center justify-between px-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Image
                        src={user.image || `https://api.dicebear.com/9.x/glass/svg?seed=${user.username}`}
                        alt={user.name}
                        width={36}
                        height={36}
                        unoptimized
                        className="rounded-full"
                    />

                    <div className="min-w-0">
                        <h2 className="truncate font-semibold text-sm leading-none">
                            {user.name}
                        </h2>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            @{user.username}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0 -mr-1">
                    <Dialog open={open} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <button
                                aria-label="Settings"
                                className="flex h-8 w-8 items-center justify-center"
                            >
                                <Settings className="h-5 w-5" strokeWidth={3} />
                            </button>
                        </DialogTrigger>

                        <DialogContent className="bg-card border-2 border-border p-6 w-full !max-w-lg" showCloseButton={false}>
                            <DialogHeader>
                                <DialogTitle
                                    className={`text-4xl font-semibold ${playfairDisplay.className} text-primary`}
                                    style={{ fontStyle: "italic" }}
                                >
                                    Settings
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-2">
                                <Label className="font-semibold text-sm text-primary">
                                    General Settings
                                </Label>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="streamer-mode"
                                            className="mt-1 border-2"
                                            checked={streamerMode}
                                            onCheckedChange={(checked) => setStreamerMode(checked === true)}
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="streamer-mode" className="font-semibold text-sm text-primary">
                                                Streamer Mode
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Blurs sensitive information like your email, among others.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="private-account"
                                            className="mt-1 border-2"
                                            checked={privateAccount}
                                            onCheckedChange={(checked) => setPrivateAccount(checked === true)}
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="private-account" className="font-semibold text-sm text-primary">
                                                Private Account
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Makes your account private, only you can see your profile.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="stats-nerds"
                                            className="mt-1 border-2"
                                            checked={statsForNerds}
                                            onCheckedChange={(checked) => setStatsForNerds(checked === true)}
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="stats-nerds" className="font-semibold text-sm text-primary">
                                                Stats for Nerds
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Some developer stats on pages. Useful for debugging.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox
                                            id="hide-tips"
                                            className="mt-1 border-2"
                                            checked={hideTips}
                                            onCheckedChange={(checked) => setHideTips(checked === true)}
                                        />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="hide-tips" className="font-semibold text-sm text-primary">
                                                Hide Tips
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Hides tips on pages.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-semibold text-sm text-primary">
                                        App Theme
                                    </Label>
                                    <ThemeToggle />
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name" className="font-semibold text-primary">
                                            Name
                                        </Label>
                                        <Input
                                            id="name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0"
                                            placeholder="Name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="username" className="font-semibold text-primary">
                                            Username
                                        </Label>
                                        <Input
                                            id="username"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0"
                                            placeholder="Username"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end gap-2">
                                <DialogClose asChild>
                                    <Button
                                        variant="secondary"
                                        className="bg-card hover:border-primary h-10 px-5 border-2 border-border font-semibold text-base rounded-full"
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    variant="default"
                                    className="bg-primary-2 h-10 px-5 text-background font-semibold text-base rounded-full"
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
                        className="flex h-8 w-8 items-center justify-center"
                        onClick={() => authClient.signOut()}
                    >
                        <LogOut className="h-5 w-5" strokeWidth={3} />
                    </button>
                </div>
            </div>
        </Card>
    );
}
