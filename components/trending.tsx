"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { TrendingUp } from "lucide-react"

export function TrendingWidget() {
    return (
        <div className="flex items-center w-full">
            <Card className="w-full overflow-hidden border-2 border-border p-0">
                <CardHeader className="px-3 bg-card py-3 rounded-tl-md rounded-tr-md -mb-6">
                    <div className="flex items-center">
                        <div className="flex flex-col justify-center">
                            <h1 className="text-lg font-bold">trending now</h1>
                        </div>
                        <TrendingUp
                            className="ml-2 h-5 w-5"
                            strokeWidth={3}
                        />
                    </div>
                </CardHeader>
                <CardContent className="px-3 mb-4">
                    <p className="text-sm text-muted-foreground">
                        see what's popular right now.
                    </p>

                    <div className="mt-3 space-y-3">
                        <Link href="/trending/quack" className="flex items-center justify-between hover:underline">
                            <span className="font-semibold text-primary-2">#quack</span>
                            <span className="text-sm text-muted-foreground">1.2k</span>
                        </Link>

                        <Link href="/trending/qaci" className="flex items-center justify-between hover:underline">
                            <span className="font-semibold text-primary-2">#qaci</span>
                            <span className="text-sm text-muted-foreground">832</span>
                        </Link>

                        <Link href="/trending/projects" className="flex items-center justify-between hover:underline">
                            <span className="font-semibold text-primary-2">#projects</span>
                            <span className="text-sm text-muted-foreground">421</span>
                        </Link>
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}