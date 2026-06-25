"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react"
import { Widget, WidgetContent, WidgetSecondaryHeader } from "./widget";

export function TrendingWidget() {
    return (
        <Widget>
            <WidgetSecondaryHeader>
                <div className="flex items-center">
                    <div className="flex flex-col justify-center">
                        <h1 className="text-lg font-bold">trending now</h1>
                    </div>
                    <TrendingUp
                        className="ml-2 h-5 w-5"
                        strokeWidth={3}
                    />
                </div>
            </WidgetSecondaryHeader>
            <WidgetContent>
                <p className="text-sm text-muted-foreground">
                    see whats popular right now.
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

            </WidgetContent>
        </Widget>
    );
}