"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Dices } from "lucide-react"

export function RngWidget() {
    return (
        <div className="flex items-center w-full">
            <Card className="w-full overflow-hidden border-2 border-border p-0">
                <CardHeader className="px-3 bg-card py-3 rounded-tl-md rounded-tr-md -mb-6">
                    <div className="flex items-center">
                        <div className="flex items-center">
                            <h1 className="text-lg font-bold">rng?</h1>
                            <Dices className="ml-2 h-5 w-5" strokeWidth={3} />
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-3 mb-4">
                    <p className="text-sm text-muted-foreground">
                        you get one random number per day, biggest number wins. {" "}

                        <Link
                            href="/rng"
                            className="text-primary-2 font-semibold hover:underline"
                        >
                            view leaderboard
                        </Link>.
                    </p>

                    <Button
                        variant="default"
                        className="flex items-center bg-primary-2 h-8 gap-2 rounded-full px-4 py-3 text-sm font-semibold text-background mt-4"
                    >
                        <Link
                            href="/rng"
                        >
                            roll a number
                        </Link>
                    </Button>

                </CardContent>
            </Card>
        </div>
    );
}