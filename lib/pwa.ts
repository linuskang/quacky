export interface BeforeInstallPromptEvent extends Event {
    prompt: () => void
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

declare global {
    interface Window {
        deferredInstallPrompt?: BeforeInstallPromptEvent
    }
}
