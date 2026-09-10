"use client"

import { useEffect } from "react"

import type { BeforeInstallPromptEvent } from "@/lib/pwa"

export function BeforeInstallPromptListener() {
    useEffect(() => {
        function handleBeforeInstallPrompt(event: Event) {
            event.preventDefault()
            window.deferredInstallPrompt = event as BeforeInstallPromptEvent
        }

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

        return () =>
            window.removeEventListener(
                "beforeinstallprompt",
                handleBeforeInstallPrompt
            )
    }, [])

    return null
}
