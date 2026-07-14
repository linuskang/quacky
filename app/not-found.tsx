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

import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <main className="flex min-h-dvh items-center justify-center bg-background px-4 py-10">
            <div className="w-full max-w-sm text-center">
                <Image
                    src="/goose/Sleeping 2.png"
                    alt="A sleeping goose"
                    width={180}
                    height={180}
                    priority
                    className="mx-auto mb-5 h-40 w-40 object-contain"
                />
                <h1 className="mt-1 text-3xl font-extrabold text-primary">
                    This page flew away.
                </h1>
                <p className="mt-3 text-sm text-muted-foreground">
                    Quacky looked everywhere, but this page does not exist.
                </p>
                <Button size="lg" asChild className="rounded-full mt-6">
                    <Link href="/">Go home</Link>
                </Button>
            </div>
        </main>
    )
}
