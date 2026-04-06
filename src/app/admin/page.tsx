// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

// This is the administration panel.
// access it at /admin.
// only users with the "Admin" role can access this page.

"use client";

// Libraries
import { authClient } from "@/client/auth";

// Components
import Login from "@/components/login";
import AdminPanel from "@/components/quacky/admin/panel";

export default function Administration() {
    const { data: session } = authClient.useSession()

    // admins only. otherwise login
    if (!session || session.user.role !== "Admin") {
        return <Login />;
    }

    return (
        // ADMIN PANEL YAY
        <AdminPanel />
    );
}
