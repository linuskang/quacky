//   ______                                 __
//  /      \                               /  |
// /$$$$$$  | __    __   ______    _______ $$ |   __  __    __
// $$ |  $$ |/  |  /  | /      \  /       |$$ |  /  |/  |  /  |
// $$ |  $$ |$$ |  $$ | $$$$$$  |/$$$$$$$/ $$ |_/$$/ $$ |  $$ |
// $$ |_ $$ |$$ |  $$ | /    $$ |$$ |      $$   $$<  $$ |  $$ |
// $$ / \$$ |$$ \__$$ |/$$$$$$$ |$$ \_____ $$$$$$  \ $$ \__$$ |
// $$ $$ $$< $$    $$/ $$    $$ |$$       |$$ | $$  |$$    $$ |
//  $$$$$$  | $$$$$$/   $$$$$$$/  $$$$$$$/ $$/   $$/  $$$$$$$ |
//      $$$/                                         /  \__$$ |
//                                                   $$    $$/
//                                                    $$$$$$/
//
// Linus Kang, 2026
// Work is licensed under the CC BY-NC 4.0 license.

"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
    theme: Theme
    resolvedTheme: "light" | "dark"
    setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function useTheme() {
    const context = React.useContext(ThemeContext)

    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }

    return context
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = React.useState<Theme>("system")
    const [resolvedTheme, setResolvedTheme] = React.useState<
        "light" | "dark"
    >("light")

    React.useEffect(() => {
        const stored = window.localStorage.getItem("theme")
        if (stored === "light" || stored === "dark" || stored === "system") {
            React.startTransition(() => setThemeState(stored))
        }
    }, [])

    React.useEffect(() => {
        const media = window.matchMedia("(prefers-color-scheme: dark)")
        const updateTheme = () => {
            const nextTheme =
                theme === "system"
                    ? media.matches
                        ? "dark"
                        : "light"
                    : theme

            setResolvedTheme(nextTheme)
            document.documentElement.classList.toggle(
                "dark",
                nextTheme === "dark"
            )
        }

        updateTheme()
        if (theme === "system") {
            media.addEventListener("change", updateTheme)
        }

        return () => media.removeEventListener("change", updateTheme)
    }, [theme])

    const setTheme = (nextTheme: Theme) => {
        setThemeState(nextTheme)
        window.localStorage.setItem("theme", nextTheme)
    }

    return (
        <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
            <ThemeHotkey />
            {children}
        </ThemeContext.Provider>
    )
}

function isTypingTarget(target: EventTarget | null) {
    if (!(target instanceof HTMLElement)) {
        return false
    }

    return (
        target.isContentEditable ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT"
    )
}

function ThemeHotkey() {
    const { resolvedTheme, setTheme } = useTheme()

    React.useEffect(() => {
        function onKeyDown(event: KeyboardEvent) {
            if (event.defaultPrevented || event.repeat) {
                return
            }

            if (event.metaKey || event.ctrlKey || event.altKey) {
                return
            }

            if (event.key.toLowerCase() !== "d") {
                return
            }

            if (isTypingTarget(event.target)) {
                return
            }

            setTheme(resolvedTheme === "dark" ? "light" : "dark")
        }

        window.addEventListener("keydown", onKeyDown)

        return () => {
            window.removeEventListener("keydown", onKeyDown)
        }
    }, [resolvedTheme, setTheme])

    return null
}

export { ThemeProvider, useTheme }
