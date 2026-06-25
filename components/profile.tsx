import Image from "next/image";
import { Settings, LogOut } from "lucide-react";

import {
    Card,
} from "@/components/ui/card";

interface ProfileProps {
    profile: {
        name: string;
        handle: string;
        image: string;
    };
}

export function Profile({ profile }: ProfileProps) {
    return (
        <div>
            <div className="mt-auto">
                <Card className="w-full h-15 border-2 border-border">
                    <div className="flex h-full items-center justify-between px-3">
                        <div className="flex min-w-0 items-center gap-3">
                            <Image
                                src={profile.image}
                                alt={profile.name}
                                width={36}
                                height={36}
                                className="rounded-full"
                            />

                            <div className="min-w-0">
                                <h2 className="truncate font-semibold text-sm leading-none">
                                    {profile.name}
                                </h2>

                                <p className="mt-1 truncate text-xs text-muted-foreground">
                                    @{profile.handle}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-0 -mr-1">
                            <button
                                aria-label="Settings"
                                className="flex h-8 w-8 items-center justify-center"
                            >
                                <Settings className="h-5 w-5" strokeWidth={3} />
                            </button>

                            <button
                                aria-label="Log out"
                                className="flex h-8 w-8 items-center justify-center"
                            >
                                <LogOut className="h-5 w-5" strokeWidth={3} />
                            </button>
                        </div>
                    </div>
                </Card >
            </div>
        </div>
    );
}