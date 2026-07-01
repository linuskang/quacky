import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

const subscribe = () => () => {};

export function SharePost({ shareUrl }: { shareUrl: string }) {
    const [shareOpen, setShareOpen] = useState(false);
    const hydrated = useSyncExternalStore(subscribe, () => true, () => false);
    const fullShareUrl = !hydrated
        ? shareUrl
        : new URL(shareUrl, window.location.origin).toString();

    return (
        <Dialog open={shareOpen} onOpenChange={setShareOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="h-8 py-1 px-1.5 text-md font-semibold text-primary/80 hover:text-primary !bg-card-primary border-2 border-border hover:bg-background hover:border-primary"
                >
                    <Share2
                        strokeWidth={3}
                        size={16}
                    />
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card-primary border-2 border-border w-full !max-w-lg" showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle className="text-lg font-bold text-primary">Share post</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Input
                        value={fullShareUrl}
                        readOnly
                        onFocus={(e) => e.target.select()}
                        className="w-full h-10 !ring-0 border-2 border-border rounded-full"
                    />
                    <Button
                        type="button"
                        onClick={async () => {
                            await navigator.clipboard.writeText(fullShareUrl);
                            toast.success("Copied link");
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
