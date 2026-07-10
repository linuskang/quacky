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

"use client";
import { Widget, WidgetContent, WidgetSecondaryHeader } from "./widget";
import { User } from "@/types";

export default function RelevantPeopleWidget(
    { users }: { users: User[] }
) {
    return (
        <Widget>
            <WidgetSecondaryHeader>
                <h1 className="text-lg font-bold">relevant people</h1>
            </WidgetSecondaryHeader>
            <WidgetContent>
                <p className="text-sm text-muted-foreground">
                    people you may want to follow.
                </p>
                <div className="mt-3 space-y-3">
                    {users.map((user) => (
                        <div key={user.username} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="h-10 w-10 rounded-full"
                                />
                                <div className="flex flex-col">
                                    <span className="font-semibold">{user.name}</span>
                                    <span className="text-sm text-muted-foreground">@{user.username}</span>
                                </div>
                            </div>
                            <button className="rounded-full bg-primary-2 px-3 py-1 text-sm font-semibold text-white hover:bg-primary-3">
                                Follow
                            </button>
                        </div>
                    ))}
                </div>
            </WidgetContent>
        </Widget>
    );
}