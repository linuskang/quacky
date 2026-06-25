"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function AboutWidget() {
    return (
        <div className="flex items-center w-full">
            <Card className="w-full overflow-hidden border-2 border-border p-0">
                <CardHeader className="px-3 py-3 rounded-tl-md rounded-tr-md -mb-4">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col justify-center">
                            <h1 className="text-lg font-bold">Queensland Academies for Creative Industries</h1>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-3 py-3 -mt-4">
                    <p className="text-sm text-muted-foreground">
                        Welcome! This is an unofficial QACI community for my Premier Coding Competition submission.
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="font-semibold">1,248</p>
                            <p className="text-muted-foreground">Members</p>
                        </div>

                        <div>
                            <p className="font-semibold">42,817</p>
                            <p className="text-muted-foreground">Posts</p>
                        </div>
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground mt-4">
                        Quacky is v1.0.0
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}