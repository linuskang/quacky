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
import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { trpc } from "@/lib/trpc"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"

export default function Page() {
    const [showUpload, setShowUpload] = useState(false)
    const router = useRouter()
    const utils = trpc.useUtils()
    const createShortMutation = trpc.shorts.create.useMutation({
        onSuccess: async (data) => {
            setShowUpload(false)
            toast.success("Short uploaded!")
            await utils.shorts.list.invalidate()
            router.push(`/shorts/${data.shortId}`)
        },
        onError: (err) => {
            toast.error(err.message || "Failed to upload short")
        },
    })

    function handleUpload(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        createShortMutation.mutate(formData)
    }

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
                        <form onSubmit={handleUpload}>
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
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={createShortMutation.isPending}
                            >
                                {createShortMutation.isPending
                                    ? "Uploading..."
                                    : "Upload"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <p>Shorts are currently disabled by admin. please come back later</p>
            </PageCenter>
        </PageLayout>
    )
}
