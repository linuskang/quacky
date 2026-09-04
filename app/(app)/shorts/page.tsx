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

import { PageLayout, PageCenter } from "@/components/page-layout"
import { playfairDisplay } from "@/lib/fonts"
import { Title } from "@/components/text"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export default function Page() {
    const [showUpload, setShowUpload] = useState(false)

    return (
        <PageLayout>
            <PageCenter>
                <div className="flex items-center">
                    <Title className={playfairDisplay.className}>Shorts</Title>
                    <Button
                        variant="secondary"
                        className="mt-4 ml-auto"
                        onClick={() => setShowUpload(true)}
                    >
                        Upload a short
                    </Button>
                </div>
                <Dialog open={showUpload} onOpenChange={setShowUpload}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Upload a short</DialogTitle>
                            <DialogDescription>
                                Upload a short video to share with the
                                community.
                            </DialogDescription>
                        </DialogHeader>
                        <form
                            action="/api/shorts"
                            method="POST"
                            encType="multipart/form-data"
                        >
                            <input
                                type="file"
                                name="video"
                                accept="video/*"
                                required
                            />
                            <input
                                type="text"
                                name="description"
                                placeholder="Description"
                            />
                            <Button type="submit" className="mt-4 w-full">
                                Upload
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </PageCenter>
        </PageLayout>
    )
}
