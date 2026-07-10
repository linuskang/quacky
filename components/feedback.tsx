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

import { useState } from "react";
import Image from "next/image";
import { Patrick_Hand } from "next/font/google";
import { CurvedLine } from "./curved_parabola";
import { Dialog, DialogClose, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { playfairDisplay } from "@/app/layout";
import { toast } from "sonner";

const patrickHand = Patrick_Hand({
    subsets: ["latin"],
    weight: "400",
});

function Scale({ value, onChange }: { value: number; onChange: (n: number) => void }) {
    return (
        <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
                <Button
                    key={n}
                    type="button"
                    variant={value === n ? "default" : "secondary"}
                    className="h-8 w-8 border-2 border-border rounded-full p-0 text-xs font-semibold"
                    onClick={() => onChange(n)}
                >
                    {n}
                </Button>
            ))}
        </div>
    );
}

export function Feedback() {
    const [isHovered, setIsHovered] = useState(false);
    const [open, setOpen] = useState(false);
    const [usability, setUsability] = useState(0);
    const [satisfaction, setSatisfaction] = useState(0);
    const [recommend, setRecommend] = useState(0);
    const [visual, setVisual] = useState(0);
    const [comments, setComments] = useState("");

    const handleSend = async () => {
        if (usability === 0 || satisfaction === 0 || recommend === 0 || visual === 0 || comments.trim() === "") {
            toast.error("Please answer all required fields.");
            return;
        }

        const data = {
            usability,
            satisfaction,
            recommend,
            visual,
            comments,
        };

        await fetch("/api/feedback-portal", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        toast.success("Feedback sent! Thank you for trying out Quacky.");

        setUsability(0);
        setSatisfaction(0);
        setRecommend(0);
        setVisual(0);
        setComments("");
        setOpen(false);
    };

    return (
        <>
            <div className="fixed bottom-44 right-24 z-10 pointer-events-none">
                <div className="relative w-64 h-32">
                    <span
                        className={`${patrickHand.className} absolute left-0 top-0 text-2xl font-bold`}
                    >
                        have any feedback
                        for me?
                    </span>

                    <CurvedLine
                        from={{ x: 100, y: 50 }}
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
                        className="fixed -bottom-10 -right-15 z-0 cursor-pointer transition-transform duration-200 hover:scale-110 active:scale-95"
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
                <DialogContent className="bg-card border-2 border-border p-6 w-full !max-w-lg" showCloseButton={false}>
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
                            <Label className="font-semibold text-sm text-primary">
                                <span>
                                    How usable is this website?{"\u00A0"}<span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale value={usability} onChange={setUsability} />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-sm text-primary">
                                <span>
                                    How satisfied are you with the overall user experience?{"\u00A0"}<span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale value={satisfaction} onChange={setSatisfaction} />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-sm text-primary">
                                <span>
                                    How likely are you to recommend this website to others?{"\u00A0"}<span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale value={recommend} onChange={setRecommend} />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-sm text-primary">
                                <span>
                                    How visually appealing is the design of this website?{"\u00A0"}<span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Scale value={visual} onChange={setVisual} />
                        </div>

                        <div className="space-y-2">
                            <Label className="font-semibold text-sm text-primary">
                                <span>
                                    Do you have any additional comments or suggestions for improvement?{"\u00A0"}<span className="text-destructive">*</span>
                                </span>
                            </Label>
                            <Textarea
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                                placeholder="Type your feedback here..."
                                className="min-h-24 border-2 border-border hover:border-primary focus:border-primary !ring-0"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-2">
                        <DialogClose asChild>
                            <Button
                                variant="secondary"
                                className="bg-card hover:border-primary h-10 px-5 border-2 border-border font-semibold text-base rounded-full"
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            variant="default"
                            className="bg-primary-2 h-10 px-5 text-background font-semibold text-base rounded-full"
                            onClick={handleSend}
                        >
                            Send Feedback
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
