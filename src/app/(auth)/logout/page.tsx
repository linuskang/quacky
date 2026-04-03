// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://kang.software/git/quacky

"use client";

// Libraries
import { authClient } from "@/client/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// UI Components
import Loading from "@/components/loading";

export default function Page() {
    const router = useRouter();

    useEffect(() => {
        const signOut = async () => {
            await authClient.signOut();
            router.push("/");
        };

        signOut();
    }, [router]);

    return (
        <Loading />
    );
}
