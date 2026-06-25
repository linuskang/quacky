"use client";

import Image from "next/image";
import { Settings, LogOut } from "lucide-react";
import { authClient } from "@/client/auth";

import { useState } from "react"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

import { playfairDisplay, timesNewRoman } from "@/app/layout";

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

interface ProfileProps {
    profile: {
        name: string;
        handle: string;
        image?: string | null;
    };
}

export function Profile({ profile }: ProfileProps) {
    return (
        <Card className="w-full h-15 border-2 border-border">
            <div className="flex h-full items-center justify-between px-3">
                <div className="flex min-w-0 items-center gap-3">
                    <Image
                        src={profile.image || `https://api.dicebear.com/9.x/glass/svg?seed=${profile.handle}`}
                        alt={profile.name}
                        width={36}
                        height={36}
                        unoptimized
                        className="rounded-full"
                    />

                    <div className="min-w-0">
                        <h2 className="truncate font-semibold text-sm leading-none">
                            {profile.name}
                        </h2>

                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            @{profile.handle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0 -mr-1">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button
                                aria-label="Settings"
                                className="flex h-8 w-8 items-center justify-center"
                            >
                                <Settings className="h-5 w-5" strokeWidth={3} />
                            </button>
                        </DialogTrigger>

                        <DialogContent className="bg-card border-2 border-border p-6 w-full !max-w-lg">
                            <DialogHeader>
                                <DialogTitle
                                    className={`text-4xl font-semibold ${playfairDisplay.className}`}
                                    style={{ fontStyle: "italic" }}
                                >
                                    Settings
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-4">
                                    <div className="flex items-start gap-3">
                                        <Checkbox id="streamer-mode" className="mt-1" />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="streamer-mode" className="font-semibold text-sm">
                                                Streamer mode
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Blurs sensitive content across the app for safer screen sharing.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Checkbox id="private-account" className="mt-1" />
                                        <div className="space-y-0.5">
                                            <Label htmlFor="private-account" className="font-semibold text-sm">
                                                Private account
                                            </Label>
                                            <p className="text-xs text-muted-foreground">
                                                Only approved followers can view your profile and posts.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0" placeholder={profile.name} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="username">Username</Label>
                                        <Input id="username" className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0" placeholder={`@${profile.handle}`} />
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
                                >
                                    Save
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