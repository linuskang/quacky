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
import { useState, useEffect } from "react"

export function AboutWidget() {
    const [members, setMembers] = useState<number | null>(null)
    const [posts, setPosts] = useState<number | null>(null)
    const [name, setName] = useState<string | null>(null)
    const [description, setDescription] = useState<string | null>(null)
    const [version, setVersion] = useState<string | null>(null)

    useEffect(() => {
        fetch("/api/meta")
            .then((response) => response.json())
            .then((data) => {
                setMembers(data.stats.users)
                setPosts(data.stats.posts)
                setName(data.org.name)
                setDescription(data.org.description)
                setVersion(data.version)
            })
            .catch((error) => {
                console.error("Error fetching about data:", error)
            })
    }, [])
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
