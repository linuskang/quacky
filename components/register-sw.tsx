"use client"

import { useEffect } from "react"

export function RegisterServiceWorker() {
    useEffect(() => {
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker
                .register("/sw.js", {
                    scope: "/",
                    updateViaCache: "none",
                })
                .catch((err) => {
                    console.error("SW registration failed:", err)
                })
        }
    }, [])

    return null
}

// github/linuskang/up