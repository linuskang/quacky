"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setFollowing } from "./helpers";
import { authClient } from "@/client/auth";
import { playfairDisplay } from "@/app/layout";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type FollowProps = {
    currentUserId: string;
    initialBio?: string | null;
    initialBannerImage?: string | null;
    initialFollowing: boolean;
    initialImage: string;
    initialLocation?: string | null;
    initialName: string;
    initialPronoun?: string | null;
    initialWebsite?: string | null;
    userId: string;
    username: string;
};

export function ProfileAction({
    currentUserId,
    initialBio,
    initialBannerImage,
    initialFollowing,
    initialLocation,
    initialPronoun,
    initialWebsite,
    userId,
    username,
}: FollowProps) {
    const [following, setLocalFollowing] = useState(initialFollowing);
    const [pending, startTransition] = useTransition();
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [bannerImage, setBannerImage] = useState(initialBannerImage ?? "");
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState(initialBannerImage ?? "");
    const [bio, setBio] = useState(initialBio ?? "");
    const [pronoun, setPronoun] = useState(initialPronoun ?? "");
    const [location, setLocation] = useState(initialLocation ?? "");
    const [website, setWebsite] = useState(initialWebsite ?? "");
    const bannerInputRef = useRef<HTMLInputElement>(null);

    async function saveProfile() {
        setSaving(true);

        let nextBannerImage = bannerImage;

        if (bannerFile) {
            const formData = new FormData();
            formData.append("file", bannerFile);

            const uploadRes = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const upload = await uploadRes.json() as { url?: string; err?: string };

            if (!uploadRes.ok || !upload.url) {
                setSaving(false);
                toast.error(upload.err ?? "Failed to upload banner image");
                return;
            }

            nextBannerImage = upload.url;
            setBannerImage(nextBannerImage);
            setBannerPreview(nextBannerImage);
            setBannerFile(null);
        }

        const payload: Record<string, unknown> = {};

        if (nextBannerImage !== (initialBannerImage ?? "")) payload.bannerImage = nextBannerImage || null;
        if (bio !== (initialBio ?? "")) payload.bio = bio || null;
        if (pronoun !== (initialPronoun ?? "")) payload.pronoun = pronoun || null;
        if (location !== (initialLocation ?? "")) payload.location = location || null;
        if (website !== (initialWebsite ?? "")) payload.website = website || null;

        if (Object.keys(payload).length === 0) {
            setSaving(false);
            setEditOpen(false);
            return;
        }

        await authClient.updateUser(payload, {
            onSuccess: () => {
                setSaving(false);
                setEditOpen(false);
                toast.success("Profile updated");

            },
            onError: (ctx) => {
                setSaving(false);
                toast.error(ctx.error.message);
            },
        });
    }

    if (currentUserId === userId) {
        return (
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="secondary"
                        className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold text-background hover:bg-primary-2/80"
                    >
                        Edit Profile
                    </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto border-2 w-full !max-w-lg border-border bg-card" showCloseButton={false}>
                    <DialogHeader>
                        <DialogTitle
                            className={`text-4xl font-semibold ${playfairDisplay.className} text-primary`}
                            style={{ fontStyle: "italic" }}
                        >
                            Profile Settings
                        </DialogTitle>
                    </DialogHeader>

                    <p className="text-sm text-muted-foreground">
                        this is a place for you to express yourself through your public profile! please keep it appropriate.
                    </p>
                    <div className="grid gap-4">

                        <div className="grid gap-2">
                            <Label>Banner Image</Label>
                            <div className="overflow-hidden rounded-lg bg-background">
                                {bannerPreview ? (
                                    <Image
                                        src={bannerPreview}
                                        alt="Banner preview"
                                        width={800}
                                        height={220}
                                        unoptimized
                                        className="h-32 w-full object-cover"
                                    />
                                ) : null}
                            </div>
                            <input
                                ref={bannerInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] ?? null;
                                    setBannerFile(file);

                                    if (file) {
                                        setBannerPreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="h-9 rounded-full border-2 border-border bg-card px-4 font-semibold hover:border-primary"
                                    onClick={() => bannerInputRef.current?.click()}
                                >
                                    Upload Banner
                                </Button>
                                {bannerImage && !bannerFile && (
                                    <Button
                                        type="button"
                                        variant="secondary"
                                        className="h-9 rounded-full border-2 border-border bg-card px-4 font-semibold hover:border-primary"
                                        onClick={() => {
                                            setBannerImage("");
                                            setBannerPreview("");
                                            setBannerFile(null);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                )}
                                {bannerFile && (
                                    <p className="max-w-64 truncate text-xs text-muted-foreground">
                                        {bannerFile.name}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="profile-bio">Bio</Label>
                            <Textarea
                                id="profile-bio"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0"
                                placeholder="Bio"
                            />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="profile-pronoun">Pronouns</Label>
                                <Input
                                    id="profile-pronoun"
                                    value={pronoun}
                                    onChange={(e) => setPronoun(e.target.value)}
                                    className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0"
                                    placeholder="Pronouns"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="profile-location">Location</Label>
                                <Input
                                    id="profile-location"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0"
                                    placeholder="Location"
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="profile-website">Website</Label>
                            <Input
                                id="profile-website"
                                value={website}
                                onChange={(e) => setWebsite(e.target.value)}
                                className="border-2 border-border h-10 !text-sm hover:border-primary focus:border-primary !ring-0"
                                placeholder="Website"
                            />
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
                            onClick={saveProfile}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    function toggleFollow() {
        // basically to see if the user is following or not, and then flip to opposite for the function call.
        const nextFollowing = !following;

        startTransition(async () => {
            try {
                const res = await setFollowing(username, nextFollowing);
                setLocalFollowing(res.following);
                // cool toaster thing
                toast.success(`You ${res.following ? "followed" : "unfollowed"} ${username}`);
            } catch {
                toast.error("Something went wrong");
            }
        });
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant={following ? "secondary" : "default"}
                disabled={pending}
                onClick={toggleFollow}
                className="h-8 rounded-full bg-primary-2 px-4 text-sm font-semibold text-background hover:bg-primary-2/80"
            >
                {pending ? "Saving..." : following ? "Unfollow" : "Follow"}
            </Button>

            <Button
                asChild
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-2 border-border bg-card hover:border-primary"
                aria-label={`Message ${username}`}
            >
                <Link href={`/dms/${username}`}>
                    <MessageSquare strokeWidth={2.5} />
                </Link>
            </Button>
        </div>
    );
}
