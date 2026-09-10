"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Widget,
    WidgetContent,
    WidgetSecondaryHeader,
} from "@/components/widgets/widget"

export function ParentEmailWidget() {
    const [parentEmail, setParentEmail] = useState<string | null>(null)
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetch("/api/parent-email")
            .then(async (response) => {
                if (!response.ok) return
                const data = (await response.json()) as {
                    parentEmail: string | null
                }
                setParentEmail(data.parentEmail)
            })
            .catch(() => undefined)
            .finally(() => setLoading(false))
    }, [])

    async function saveParentEmail() {
        setSaving(true)

        try {
            const response = await fetch("/api/parent-email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ parentEmail: email }),
            })
            const data = (await response.json()) as {
                parentEmail?: string
                error?: string
            }

            if (!response.ok) {
                toast.error(data.error ?? "Could not save parent email")
                return
            }

            setParentEmail(data.parentEmail ?? email)
            setEmail("")
            toast.success("Parent email saved")
        } catch {
            toast.error("Could not save parent email")
        } finally {
            setSaving(false)
        }
    }

    return (
        <Widget>
            <WidgetSecondaryHeader>
                <h2 className="text-lg font-bold text-primary">
                    Add your parents or caregivers
                </h2>
            </WidgetSecondaryHeader>
            <WidgetContent>
                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading...</p>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Send  email updates home to let your parents know what you&apos;re learning in Qky!
                        </p>
                        <Input
                            type="email"
                            value={parentEmail ?? email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="parent@example.com"
                            className="h-9"
                            disabled={Boolean(parentEmail)}
                        />
                        <Button
                            type="button"
                            onClick={saveParentEmail}
                            disabled={Boolean(parentEmail) || !email.trim() || saving}
                            className="h-9 rounded-full bg-primary-2 text-sm font-semibold text-background hover:bg-primary-2/80"
                        >
                            {saving ? "Saving..." : parentEmail ? "Saved" : "Add parent"}
                        </Button>
                        {parentEmail && (
                            <p className="text-xs text-muted-foreground">
                                Saved! You can update this in profile settings
                            </p>
                        )}
                    </>
                )}
            </WidgetContent>
        </Widget>
    )
}
