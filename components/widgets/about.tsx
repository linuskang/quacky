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

import {
    Widget,
    WidgetSecondaryHeader,
    WidgetContent,
} from "@/components/widgets/widget"
import { trpc } from "@/lib/trpc"

export function AboutWidget() {
    const { data } = trpc.meta.get.useQuery()
    const members = data?.stats.users ?? null
    const posts = data?.stats.posts ?? null
    const name = data?.org.name ?? null
    const description = data?.org.description ?? null
    const version = data?.version ?? null
    return (
        <Widget>
            <WidgetSecondaryHeader>
                <div className="flex items-center gap-3">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold text-primary">
                            {name}
                        </h1>
                    </div>
                </div>
            </WidgetSecondaryHeader>
            <WidgetContent>
                <p className="text-sm whitespace-pre-line text-muted-foreground">
                    {description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="font-semibold">
                            {members?.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Members</p>
                    </div>

                    <div>
                        <p className="font-semibold">
                            {posts?.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground">Posts</p>
                    </div>
                </div>

                <p className="text-xs font-semibold text-muted-foreground">
                    Quacky is v{version}
                </p>
            </WidgetContent>
        </Widget>
    )
}
