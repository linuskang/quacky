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

import { notFound } from "next/navigation"
import { PageLayout, PageCenter, PageRight } from "@/components/page-layout"
import { SearchBar } from "@/components/search-bar"
import { Card, CardHeader, CardContent } from "@/components/ui/card"
import Image from "next/image"
import {
    AtSign,
    BadgeCheck,
    ExternalLink,
    Landmark,
    MapPin,
    Star,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { requireSession } from "@/server/auth"
import { getUser } from "@/server/users"
import { getPostsByUserId } from "@/server/posts"
import { ProfileAction } from "./action"
import { PurpleWarning } from "@/components/warning-cards"
import Link from "next/link"
import { Markdown } from "@/components/markdown-renderer"
import { PostList } from "@/components/posts/post"
import { CommentCard } from "@/components/comment"
import { getCommentsByUserId } from "@/server/comment"
import { ReportUser } from "@/components/report"
import { FollowCounts } from "@/components/follow-dialog"

// This profile page is split into multiple parts:
// Server utilities (server functions for fetching user data, and follow/unfollow functions)
// Server component (this page)
// Client component (profile action e.g. follow/edit profile, along with its server sided utilities at ./action.tsx and ./helpers.ts)

export default async function Page({
    params,
}: {
    params: Promise<{ handle: string }>
}) {
    // Basics: Fetch session, and user from param.
    const session = await requireSession()
    const { handle } = await params
    const user = await getUser(handle)

    // if the user doesn't exist.
    if (!user) {
        notFound()
    }

    // same as below
    const followsYou = user.following.includes(session.user.username)
    const following = user.followers.includes(session.user.username)

    // for dropdowns. pre fetch on load.
    const posts = await getPostsByUserId(user.id, session)
    const replies = await getCommentsByUserId(user.id)

    return (
        <PageLayout>
            <PageCenter>
                <Link
                    href="/"
                    className="mb-3 flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                >
                    Go back
                </Link>
                <Card className="mx-auto w-full max-w-lg overflow-hidden !bg-profile-card">
                    <CardHeader className="-mt-4 p-0">
                        {!user.banned && user.bannerImage && (
                            <Image
                                src={user.bannerImage}
                                alt={user.name!}
                                width={1200}
                                height={320}
                                unoptimized
                                className="h-40 w-full rounded-t-lg object-cover"
                            />
                        )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex">
                            <div className="flex items-start gap-4">
                                <Image
                                    src={user.image}
                                    alt={user.name}
                                    width={50}
                                    height={50}
                                    unoptimized
                                    className="h-15 w-15 rounded-full object-cover"
                                />

                                <div className="flex flex-col">
                                    <h1 className="flex items-center gap-1 text-2xl font-bold">
                                        {user.name}
                                        {!user.banned && (
                                            <>
                                                {user.verified && (
                                                    <BadgeCheck className="h-[20px] w-[20px] fill-primary text-profile-card" />
                                                )}
                                                {!user.private &&
                                                    user.pronoun && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {user.pronoun}
                                                        </span>
                                                    )}
                                                {followsYou && (
                                                    <span className="ml-1 rounded-full bg-card px-2 py-0.5 text-xs font-semibold text-primary">
                                                        Follows you
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </h1>
                                    <p className="text-base text-muted-foreground">
                                        @{user.username}
                                    </p>
                                    {!user.private && (
                                        <FollowCounts
                                            handle={user.username}
                                            followingCount={
                                                user.following.length
                                            }
                                            followersCount={
                                                user.followers.length
                                            }
                                        />
                                    )}
                                </div>
                            </div>

                            {!user.banned && (
                                <div className="mb-auto ml-auto">
                                    <ProfileAction
                                        currentUserId={session.user.id}
                                        initialBio={user.bio}
                                        initialBannerImage={user.bannerImage}
                                        initialFollowing={following}
                                        initialImage={user.image}
                                        initialLocation={user.location}
                                        initialName={user.name}
                                        initialPronoun={user.pronoun}
                                        initialWebsite={user.website}
                                        userId={user.id}
                                        username={user.username}
                                    />
                                </div>
                            )}
                        </div>

                        {user.banned && (
                            <div className="mt-3">
                                <PurpleWarning text="This user is banned." />
                            </div>
                        )}

                        {!user.banned &&
                            (!user.private ? (
                                user.bio ? (
                                    <Markdown>{user.bio}</Markdown>
                                ) : (
                                    <p className="mt-3 text-base whitespace-pre-wrap text-muted-foreground italic">
                                        {user.private
                                            ? "This profile is private."
                                            : "No bio yet."}
                                    </p>
                                )
                            ) : (
                                <p className="mt-3 text-base whitespace-pre-wrap text-muted-foreground italic">
                                    This account is private
                                </p>
                            ))}

                        {!user.banned && (
                            <div className="mt-3 flex flex-wrap gap-x-2 gap-y-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1 font-semibold">
                                    <AtSign
                                        className="h-4 w-4"
                                        strokeWidth={3}
                                    />
                                    {new Date(
                                        user.createdAt
                                    ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                    })}
                                </span>

                                {!user.private && (
                                    <>
                                        <span className="flex items-center gap-1 font-semibold">
                                            <Star
                                                className="h-4 w-4"
                                                strokeWidth={3}
                                            />
                                            {user.xp} xp
                                        </span>
                                        <span className="flex items-center gap-1 font-semibold">
                                            <Landmark
                                                className="h-4 w-4"
                                                strokeWidth={3}
                                            />
                                            {user.points}$
                                        </span>
                                        {user.location && (
                                            <span className="flex items-center gap-1 font-semibold">
                                                <MapPin
                                                    className="h-4 w-4"
                                                    strokeWidth={3}
                                                />
                                                {user.location}
                                            </span>
                                        )}

                                        {user.website && (
                                            <a
                                                href={user.website}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="flex items-center gap-1 font-semibold hover:underline"
                                            >
                                                <ExternalLink
                                                    className="h-4 w-4"
                                                    strokeWidth={3}
                                                />
                                                {user.website.replace(
                                                    /^https?:\/\//,
                                                    ""
                                                )}
                                            </a>
                                        )}
                                    </>
                                )}

                                {session.user.id !== user.id && (
                                    <ReportUser
                                        offenderHandle={user.username}
                                    />
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {!user.banned &&
                    (!user.private ? (
                        <Tabs
                            defaultValue="posts"
                            className="mx-auto -mt-2 w-full max-w-lg gap-0"
                        >
                            <TabsList className="mt-3 grid h-auto w-full grid-cols-3 gap-3 rounded-none bg-transparent p-0">
                                <TabsTrigger
                                    value="posts"
                                    className="h-10 rounded-full border-2 border-border bg-background/80 px-5 text-base font-extrabold text-foreground hover:border-primary data-active:!border-primary data-active:!bg-background"
                                >
                                    Recent Posts
                                </TabsTrigger>
                                <TabsTrigger
                                    value="replies"
                                    className="h-10 rounded-full border-2 border-border bg-background/80 px-5 text-base font-extrabold text-foreground hover:border-primary data-active:!border-primary data-active:!bg-background"
                                >
                                    Comments
                                </TabsTrigger>
                                <TabsTrigger
                                    value="badges"
                                    className="h-10 rounded-full border-2 border-border bg-background/80 px-5 text-base font-extrabold text-foreground hover:border-primary data-active:!border-primary data-active:!bg-background"
                                >
                                    Badges
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent
                                value="posts"
                                className="w-full p-0 pt-6 text-sm text-muted-foreground"
                            >
                                <PostList posts={posts} />
                            </TabsContent>
                            <TabsContent
                                value="replies"
                                className="w-full p-0 pt-6 text-sm text-muted-foreground"
                            >
                                {replies.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        User has not commented on any posts yet.
                                        Sad face {":("}
                                    </p>
                                ) : (
                                    <div className="flex w-full flex-col gap-4">
                                        {replies.map((reply) => (
                                            <div key={reply.id}>
                                                <Link
                                                    href={`/comment/${reply.id}`}
                                                    className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:underline"
                                                >
                                                    Replying to
                                                    <Image
                                                        src={
                                                            reply.post.author
                                                                .image
                                                        }
                                                        alt={
                                                            reply.post.author
                                                                .name
                                                        }
                                                        width={20}
                                                        height={20}
                                                        unoptimized
                                                        className="inline-block rounded-full"
                                                    />
                                                    @
                                                    {reply.post.author.username}
                                                </Link>
                                                <CommentCard comment={reply} />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent
                                value="badges"
                                className="p-0 pt-6 text-sm text-muted-foreground"
                            >
                                <Card className="p-4">
                                    {user.unlockedCommenting && (
                                        <div className="mb-2 flex items-center gap-2">
                                            <Star className="h-5 w-5 text-primary" />
                                            <span className="font-bold">
                                                Commenting Unlocked
                                            </span>
                                        </div>
                                    )}
                                    {user.unlockedPosting && (
                                        <div className="mb-2 flex items-center gap-2">
                                            <Star className="h-5 w-5 text-primary" />
                                            <span className="font-bold">
                                                Posting Unlocked
                                            </span>
                                        </div>
                                    )}
                                    {user.unlockedFuzzies && (
                                        <div className="mb-2 flex items-center gap-2">
                                            <Star className="h-5 w-5 text-primary" />
                                            <span className="font-bold">
                                                Fuzzies Unlocked
                                            </span>
                                        </div>
                                    )}
                                    {user.unlockedProfiles && (
                                        <div className="mb-2 flex items-center gap-2">
                                            <Star className="h-5 w-5 text-primary" />
                                            <span className="font-bold">
                                                Profiles Unlocked
                                            </span>
                                        </div>
                                    )}
                                </Card>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <p className="mt-3 text-center text-base whitespace-pre-wrap text-muted-foreground italic">
                            This account is private
                        </p>
                    ))}
            </PageCenter>
            <PageRight>
                <SearchBar />
            </PageRight>
        </PageLayout>
    )
}
