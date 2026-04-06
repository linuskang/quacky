// (c) 2025-2026 Linus Kang. Licensed under the Creative Commons Attribution-NonCommercial 4.0
// For more information, refer to https://creativecommons.org/licenses/by-nc/4.0/
// This file is a part of the Quacky project. For more information, see https://linuskang.au/quacky

// This is the administration panel.
// access it at /admin.
// only users with the "Admin" role can access this page.

// Libraries
import { headers } from "next/headers";
import { auth } from "@/server/auth";

// Components
import Login from "@/components/login";
import AdminPanel from "@/components/quacky/admin/panel";

export default async function Administration() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    // admins only. otherwise login
    if (!session || session.user.role !== "Admin") {
        return <Login />;
    }

    return (
        // ADMIN PANEL YAY
        <AdminPanel />
    );
}
