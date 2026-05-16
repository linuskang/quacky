// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, Bell, Monitor, Moon, Palette, Shield, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import { authClient } from "@/client/auth";

interface SettingsMenuProps {
    displayName: string;
    handle: string;
    image?: string;
    bio?: string;
    website?: string;
    location?: string;
    pronouns?: string;
    banner?: string;
    email: string;
    privateAccount: boolean;
    emailNotif: boolean;
    onSaved?: (updatedUser: {
        name: string;
        handle: string;
        bio: string;
        website: string | null;
        location: string | null;
        pronouns: string | null;
        banner: string | null;
        image: string | null;
        privateAccount: boolean;
        emailNotif: boolean;
    }) => void;
}

type Tab = "profile" | "appearance" | "preferences" | "security";

interface SessionEntry {
    id: string;
    userAgent: string | null;
    ipAddress: string | null;
    createdAt: string;
}

function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 py-4 last:border-0">
            <div className="sm:w-44 sm:shrink-0 sm:text-right pt-2">
                <span className="text-sm font-semibold text-primary">{label}</span>
                {hint && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{hint}</p>}
            </div>
            <div className="flex-1 min-w-0">{children}</div>
        </div>
    );
}

function SectionHeader({ title, onSave, saving }: { title: string; onSave?: () => void; saving?: boolean }) {
    return (
        <div className="flex items-center justify-between pb-4 mb-1 border-b-2 border-border">
            <h2 className="text-xl font-bold text-primary">{title}</h2>
            {onSave && (
                <Button
                    onClick={onSave}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/90 text-background font-bold cursor-pointer"
                >
                    {saving ? "Saving…" : "Save changes"}
                </Button>
            )}
        </div>
    );
}

export default function Settings(props: SettingsMenuProps) {
    const [activeTab, setActiveTab] = useState<Tab>("profile");
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState(props.displayName || "");
    const [handle, setHandle] = useState(props.handle || "");
    const [bio, setBio] = useState(props.bio || "");
    const [website, setWebsite] = useState(props.website || "");
    const [location, setLocation] = useState(props.location || "");
    const [pronouns, setPronouns] = useState(props.pronouns || "");
    const [avatarUrl, setAvatarUrl] = useState(props.image);
    const [bannerUrl, setBannerUrl] = useState(props.banner);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const bannerFileRef = useRef<HTMLInputElement | null>(null);

    const [emailNotifications, setEmailNotifications] = useState(props.emailNotif);
    const [privateAccount, setPrivateAccount] = useState(!!props.privateAccount);

    const [sessions, setSessions] = useState<SessionEntry[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const router = useRouter();
    const { theme, setTheme } = useTheme();

    useEffect(() => {
        setName(props.displayName || "");
        setHandle(props.handle || "");
        setBio(props.bio || "");
        setWebsite(props.website || "");
        setLocation(props.location || "");
        setPronouns(props.pronouns || "");
        setAvatarUrl(props.image);
        setBannerUrl(props.banner);
        setEmailNotifications(!!props.emailNotif);
        setPrivateAccount(!!props.privateAccount);
    }, [props.displayName, props.handle, props.bio, props.website, props.location, props.pronouns, props.image, props.banner, props.emailNotif, props.privateAccount]);

    useEffect(() => {
        if (activeTab !== "security") return;
        async function loadSessions() {
            setSessionsLoading(true);
            try {
                const res = await fetch("/api/v1/account/sessions");
                if (res.ok) {
                    const data = await res.json();
                    setSessions(data.sessions);
                }
            } finally {
                setSessionsLoading(false);
            }
        }
        loadSessions();
    }, [activeTab]);

    const patchAccount = async (extra?: object) => {
        const res = await fetch("/api/v1/account", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name, handle, bio, website, location, pronouns,
                privateAccount, emailNotif: emailNotifications,
                ...extra,
            }),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Failed (${res.status})`);
        return data;
    };

    const save = async () => {
        setSaving(true);
        try {
            const data = await patchAccount();
            if (data?.user && props.onSaved) props.onSaved(data.user);
            router.refresh();
        } catch (err) {
            alert(err instanceof Error ? err.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    const updAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/v1/account/avatar", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { alert(data?.error || "Failed to upload avatar"); return; }
        setAvatarUrl(data.user.image);
    };

    const updBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/v1/account/banner", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) { alert(data?.error || "Failed to upload banner"); return; }
        setBannerUrl(data.user.banner);
    };

    const navItems: { tab: Tab; label: string; icon: React.ReactNode }[] = [
        { tab: "profile",     label: "Profile",     icon: <User size={15} /> },
        { tab: "appearance",  label: "Appearance",  icon: <Palette size={15} /> },
        { tab: "preferences", label: "Preferences", icon: <Bell size={15} /> },
        { tab: "security",    label: "Security",    icon: <Shield size={15} /> },
    ];

    return (
        <div className="flex gap-8 w-full">

            {/* Left nav — desktop */}
            <nav className="hidden lg:flex flex-col w-44 shrink-0 gap-0.5 pt-0.5">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-3 py-2 mb-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-primary hover:bg-muted transition-colors cursor-pointer"
                >
                    <ArrowLeft size={15} />
                    Back
                </button>
                {navItems.map(({ tab, label, icon }) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer text-left ${
                            activeTab === tab
                                ? "bg-primary text-background"
                                : "text-muted-foreground hover:text-primary hover:bg-muted"
                        }`}
                    >
                        {label}
                    </button>
                ))}
            </nav>

            {/* Content */}
            <div className="flex-1 min-w-0 pb-16">

                {/* Profile */}
                {activeTab === "profile" && (
                    <div>
                        <SectionHeader title="Your profile" onSave={save} saving={saving} />
                        <FormRow label="Banner">
                            <div className="space-y-3">
                                {bannerUrl && (
                                    <div
                                        className="w-full h-28 rounded-lg bg-cover bg-center"
                                        style={{ backgroundImage: `url(${bannerUrl})` }}
                                    />
                                )}
                                <input ref={bannerFileRef} type="file" accept="image/*" className="hidden" onChange={updBanner} />
                                <Button type="button" variant="secondary" className="font-bold cursor-pointer" onClick={() => bannerFileRef.current?.click()}>
                                    Change banner
                                </Button>
                            </div>
                        </FormRow>
                        <FormRow label="Avatar">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-14 h-14">
                                    {avatarUrl
                                        ? <AvatarImage src={avatarUrl} />
                                        : <AvatarFallback className="text-lg font-bold">{handle.charAt(0).toUpperCase()}</AvatarFallback>
                                    }
                                </Avatar>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={updAvatar} />
                                <Button type="button" variant="secondary" className="font-bold cursor-pointer" onClick={() => fileRef.current?.click()}>
                                    Change avatar
                                </Button>
                            </div>
                        </FormRow>
                        <FormRow label="Display name">
                            <Input className="bg-card border border-border dark:border-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your display name" />
                        </FormRow>
                        <FormRow label="Pronouns">
                            <Input className="bg-card border border-border dark:border-input" value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="they/them" />
                        </FormRow>
                        <FormRow label="Bio">
                            <Textarea
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Tell us about yourself"
                                className="resize-none min-h-24 bg-card border border-border dark:border-input"
                            />
                        </FormRow>
                        <FormRow label="Website">
                            <Input className="bg-card border border-border dark:border-input" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://example.com" />
                        </FormRow>
                        <FormRow label="Location">
                            <Input className="bg-card border border-border dark:border-input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Earth" />
                        </FormRow>
                        <FormRow label="Handle">
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm select-none">@</span>
                                <Input
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value.replace(/^@+/, ""))}
                                    placeholder="your-handle"
                                    className="bg-card border border-border dark:border-input pl-7"
                                />
                            </div>
                        </FormRow>
                        <FormRow label="Email">
                            <Input value={props.email} disabled className="opacity-60 cursor-not-allowed bg-card border border-border dark:border-input" />
                        </FormRow>
                    </div>
                )}

                {/* Appearance */}
                {activeTab === "appearance" && (
                    <div>
                        <SectionHeader title="Appearance" />
                        <FormRow label="Theme" >
                            <div className="flex gap-2">
                                {[
                                    { value: "light",  label: "Light",  icon: <Sun size={14} /> },
                                    { value: "system", label: "System", icon: <Monitor size={14} /> },
                                    { value: "dark",   label: "Dark",   icon: <Moon size={14} /> },
                                ].map(({ value, label, icon }) => (
                                    <button
                                        key={value}
                                        onClick={() => setTheme(value)}
                                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 text-sm font-medium transition-colors cursor-pointer ${
                                            (theme ?? "system") === value
                                                ? "border-primary bg-primary text-background"
                                                : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                                        }`}
                                    >
                                        {icon}
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </FormRow>
                    </div>
                )}

                {/* Preferences */}
                {activeTab === "preferences" && (
                    <div>
                        <SectionHeader title="Preferences" onSave={save} saving={saving} />
                        <FormRow label="Email notifications" hint="Receive digest and account alerts by email">
                            <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                        </FormRow>
                        <FormRow label="Private account" hint="Only your followers can see your posts">
                            <Switch checked={privateAccount} onCheckedChange={setPrivateAccount} />
                        </FormRow>
                    </div>
                )}

                {/* Security */}
                {activeTab === "security" && (
                    <div>
                        <SectionHeader title="Security" />

                        <div className="py-6 flex items-center justify-between">
                            <div>
                                <p className="font-semibold text-primary">Sign out</p>
                                <p className="text-sm text-muted-foreground">Sign out of your account on this device.</p>
                            </div>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="default" className="font-bold cursor-pointer">Sign out</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Sign out</AlertDialogTitle>
                                        <AlertDialogDescription>Are you sure you want to sign out?</AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={async () => await authClient.signOut()}
                                            variant="default"
                                            className="font-bold cursor-pointer"
                                        >
                                            Sign out
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
