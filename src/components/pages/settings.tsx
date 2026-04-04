// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

// UI Components
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Bell, Moon, Palette, Shield, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@/client/auth";

// Utilities

interface SettingsMenuProps {
    displayName: string;
    handle: string;
    image?: string;
    bio?: string;
    email: string;

    privateAccount: boolean;
    emailNotif: boolean;
    onSaved?: (updatedUser: {
        name: string;
        handle: string;
        bio: string;
        image: string | null;
        privateAccount: boolean;
        emailNotif: boolean;
    }) => void;
};

export default function Settings(props: SettingsMenuProps) {

    // States
    const [saving, setSaving] = useState(false);
    const [name, setNameValue] = useState(props.displayName || "");
    const [handle, setHandleValue] = useState(props.handle || "");
    const [bio, setBioValue] = useState(props.bio || "");
    const [email] = useState(props.email || "");
    const [avatarUrl, setAvatarUrl] = useState<string | undefined>(props.image || undefined);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [emailNotifications, setEmailNotifications] = useState(props.emailNotif);
    const [privateAccount, setPrivateAccount] = useState(!!props.privateAccount);

    const router = useRouter();

    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setNameValue(props.displayName || "");
        setHandleValue(props.handle || "");
        setBioValue(props.bio || "");
        setAvatarUrl(props.image || undefined);
        setEmailNotifications(!!props.emailNotif);
        setPrivateAccount(!!props.privateAccount);
    }, [props.displayName, props.handle, props.bio, props.image, props.emailNotif, props.privateAccount]);

    const save = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/v1/account", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name,
                    handle,
                    bio,
                    privateAccount,
                    emailNotif: emailNotifications,
                }),
            });

            const contentType = res.headers.get("content-type") || "";
            const data = contentType.includes("application/json") ? await res.json().catch(() => null) : null;

            if (!res.ok) {
                alert(data?.error || `Failed to save account (${res.status})`);
                return;
            }

            if (data?.user && props.onSaved) {
                props.onSaved(data.user);
            }

            router.refresh();
        } catch (err) {
            console.error(err);
            alert("Failed to save account");
        } finally {
            setSaving(false);
        }
    }

    const updAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const fd = new FormData();
            fd.append("file", file);

            const res = await fetch("/api/v1/account/avatar", { method: "POST", body: fd });
            const data = await res.json();

            if (!res.ok) {
                alert(data?.error || "Failed to upload avatar");
                return;
            }

            setAvatarUrl(data.user.image);
            alert("Avatar uploaded");
        } catch (err) {
            console.error(err);
            alert("Failed to upload avatar");
        }
    };

    return (
        <section className="w-full rounded-xl">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-extrabold text-primary">Account Settings</h1>
                </div>
                <Button
                    type="button"
                    onClick={save}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-background font-bold cursor-pointer"
                >
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            <div className="space-y-6 mt-6">
                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-primary">Appearance</h2>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Website Theme</p>
                            <p className="text-sm text-muted-foreground">
                                Switch between light and dark mode.
                            </p>
                        </div>

                        <div>
                            <RadioGroup value={theme ?? "system"} onValueChange={(v) => setTheme(v)}>
                                <div className="flex items-center gap-2">
                                    <RadioGroupItem value="light" aria-label="Light">
                                        <Sun className="size-4" />
                                    </RadioGroupItem>
                                    <RadioGroupItem value="system" aria-label="System">
                                        <Palette className="size-4" />
                                    </RadioGroupItem>
                                    <RadioGroupItem value="dark" aria-label="Dark">
                                        <Moon className="size-4" />
                                    </RadioGroupItem>
                                </div>
                            </RadioGroup>
                        </div>

                    </div>
                </div>

                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4">
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-lg font-bold text-primary">Profile</h2>
                    </div>
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                {avatarUrl ? (
                                    <AvatarImage src={avatarUrl} alt="avatar" />
                                ) : (
                                    <AvatarFallback>{handle.charAt(0).toUpperCase()}</AvatarFallback>
                                )}
                            </Avatar>

                            <div>
                                <input ref={fileRef} id="avatar-file" type="file" accept="image/*" className="hidden" onChange={updAvatar} />
                                <Button type="button" onClick={() => fileRef.current?.click()} className="font-bold cursor-pointer">Change avatar</Button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="display-name">Display Name</Label>
                            <Input
                                id="display-name"
                                value={name}
                                onChange={(e) => setNameValue(e.target.value)}
                                placeholder="Your display name"
                                className="bg-background dark:bg-[var(--lynt)]"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="bio">Bio</Label>
                            <Textarea
                                id="bio"
                                value={bio}
                                onChange={(e) => setBioValue(e.target.value)}
                                placeholder="Tell us about yourself"
                                className="bg-background dark:bg-[var(--lynt)] resize-none min-h-24"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="handle">Handle</Label>

                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                    @
                                </span>

                                <Input
                                    id="handle"
                                    value={handle}
                                    onChange={(e) => setHandleValue(e.target.value.replace(/^@+/, ""))}
                                    placeholder="your-handle"
                                    className="pl-7 bg-background dark:bg-[var(--lynt)]"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                value={email}
                                placeholder="name@example.com"
                                className="bg-background dark:bg-[var(--lynt)]"
                                disabled
                            />
                        </div>

                    </div>
                </div>

                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4 space-y-4">
                    <div className="flex items-center gap-2">
                        <h2 className="text-lg font-bold text-primary">Preferences</h2>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Email Notifications</p>
                            <p className="text-sm text-muted-foreground">Receive digest and account alerts by email.</p>
                        </div>
                        <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                    </div>
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Private Account</p>
                            <p className="text-sm text-muted-foreground">Only your followers can see your posts.</p>
                        </div>
                        <Switch checked={privateAccount} onCheckedChange={setPrivateAccount} />
                    </div>
                </div>

                <div className="rounded-lg border border-black/10 dark:border-border bg-white dark:bg-background/30 p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <p className="font-semibold text-primary">Sign out</p>
                            <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                        </div>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" className="font-bold cursor-pointer">Sign out</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-white dark:bg-[var(--lynt)] border-black/10 dark:border-border">
                                <AlertDialogHeader>
                                    <AlertDialogTitle className="text-primary">Sign out</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to sign out?
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={async () => await authClient.signOut()} variant="destructive" className="font-bold cursor-pointer">Sign out</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </div>
        </section>
    )
}
