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

// Libraries
import axios from "axios"
import { useState } from "react"
import Image from "next/image"
import { toast } from "sonner"

// Components
import { Patrick_Hand } from "next/font/google"
import { CurvedLine } from "@/components/line-generator"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { playfairDisplay } from "@/app/layout"

const patrickHand = Patrick_Hand({
    subsets: ["latin"],
    weight: "400",
})

function Scale({
    value,
    onChange,
}: {
    value: number
    onChange: (n: number) => void
}) {
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
                <Button
                    key={n}
                    type="button"
                    variant={value === n ? "default" : "secondary"}
                    className="h-8 w-8 rounded-full border-2 border-border p-0 text-xs font-semibold"
                    onClick={() => onChange(n)}
                >
                    {n}
                </Button>
            ))}
        </div>
    )
}

export function Feedback() {
    const [isHovered, setIsHovered] = useState(false)
    const [open, setOpen] = useState(false)
    const [usability, setUsability] = useState(0)
    const [satisfaction, setSatisfaction] = useState(0)
    const [recommend, setRecommend] = useState(0)
    const [visual, setVisual] = useState(0)
    const [comments, setComments] = useState("")

    async function sendFeedback() {
        const data = {
            usability,
            satisfaction,
            recommend,
            visual,
            comments,
        }

        try {
            await axios.get("/api/feedback", { params: data })

            toast.success("Feedback sent! Thank you for trying out Quacky.")
        } catch {
            toast.error("Something blew up.try again later please")
        } finally {
            setUsability(0)
            setSatisfaction(0)
            setRecommend(0)
            setVisual(0)
            setComments("")
            setOpen(false)
        }
    }

    return (
        <>
            <div className="pointer-events-none fixed right-24 bottom-44 z-10">
                <div className="relative h-30 w-64">
                    <span
                        className={`${patrickHand.className} absolute top-15 left-0 text-2xl font-bold`}
                    >
                        have any feedback for me?
                    </span>

                    <CurvedLine
                        from={{ x: 130, y: 110 }}
                        to={{ x: 220, y: 160 }}
                        strokeWidth={4}
                        wobble={-50}
                    />
                </div>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        aria-label="Interactive Button"
                        className="fixed -right-15 -bottom-10 z-0 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Image
                            src={isHovered ? "/open.png" : "/close.png"}
                            alt="Interactive Button"
                            width={220}
                            height={220}
                            className="h-auto w-56"
                            priority
                        />
                    </button>
                </DialogTrigger>
                <DialogContent
                    className="w-full !max-w-lg border-2 border-border bg-card p-6"
                    showCloseButton={false}
                >
                    <DialogHeader>
                        <DialogTitle
                            className={`text-4xl font-semibold ${playfairDisplay.className} text-primary`}
                            style={{ fontStyle: "italic" }}
                        >
                            Give Feedback
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-primary">
                                <span>
                                    How usable is this website?{"\u00A0"}
                                    <span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale value={usability} onChange={setUsability} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-primary">
                                <span>
                                    How satisfied are you with the overall user
                                    experience?
                                    {"\u00A0"}
                                    <span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale
                                value={satisfaction}
                                onChange={setSatisfaction}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-primary">
                                <span>
                                    How likely are you to recommend this website
                                    to others?
                                    {"\u00A0"}
                                    <span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale value={recommend} onChange={setRecommend} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-primary">
                                <span>
                                    How visually appealing is the design of this
                                    website?
                                    {"\u00A0"}
                                    <span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale value={visual} onChange={setVisual} />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-semibold text-primary">
                                <span>
                                    Do you have any additional comments or
                                    suggestions for improvement?{"\u00A0"}
                                    <span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Type your feedback here..."
                                className="min-h-24 border-2 border-border !ring-0 hover:border-primary focus:border-primary"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                className="h-10 rounded-full border-2 border-border bg-card px-5 text-base font-semibold hover:border-primary"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="default"
                            className="h-10 rounded-full bg-primary-2 px-5 text-base font-semibold text-background"
                            onClick={sendFeedback}
                        >
                            Send Feedback
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
