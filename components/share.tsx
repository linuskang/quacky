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

import { useState, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

const subscribe = () => () => {}

export function SharePost({ shareUrl }: { shareUrl: string }) {
    const [shareOpen, setShareOpen] = useState(false)
    const hydrated = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
    const fullShareUrl = !hydrated
        ? shareUrl
        : new URL(shareUrl, window.location.origin).toString()

    return (
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="text-md h-8 border-2 border-border !bg-card-primary px-1.5 py-1 font-semibold text-primary/80 hover:border-primary hover:bg-background hover:text-primary"
                >
                    <Share2 strokeWidth={3} size={16} />
                </Button>
            </DialogTrigger>
            <DialogContent
                className="w-full !max-w-lg border-2 border-border bg-card-primary"
                showCloseButton={false}
            >
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-primary">
                        Share post
                    </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        value={fullShareUrl}
                        readOnly
                        onFocus={(e) => e.target.select()}
                        className="h-10 w-full rounded-full border-2 border-border !ring-0"
                    />
                    <Button
                        type="button"
                        onClick={async () => {
                            await navigator.clipboard.writeText(fullShareUrl)
                            toast.success("Copied link")
                        }}
                        className="h-10 rounded-full bg-primary-2 px-4 text-sm font-semibold hover:bg-primary-2/80"
                    >
                        Copy
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
