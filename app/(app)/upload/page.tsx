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

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null)
    const [result, setResult] = useState("")
    const [pending, setPending] = useState(false)

    async function upload() {
        if (!file) return

        setPending(true)
        setResult("")

        const formData = new FormData()
        formData.append("file", file)

        const res = await fetch("/api/upload", {
            method: "POST",
            body: formData,
        })

        const data = await res.json()

        setResult(JSON.stringify(data, null, 2))
        setPending(false)
    }

    return (
        <div>
            <input
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="text-sm"
            />
            <Button
                onClick={upload}
                disabled={!file || pending}
                className="w-fit"
            >
                {pending ? "Uploading..." : "Upload"}
            </Button>
            {result && (
                <pre className="overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                    {result}
                </pre>
            )}
        </div>
    )
}
