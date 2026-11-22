"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Widget,
    WidgetContent,
    WidgetSecondaryHeader,
} from "@/components/widgets/widget"
import { trpc } from "@/lib/trpc"

export function ParentEmailWidget() {
    const [email, setEmail] = useState("")
    const utils = trpc.useUtils()
    const { data, isLoading: loading } = trpc.me.parentEmailGet.useQuery()
    const parentEmail = data?.parentEmail ?? null

    const saveMutation = trpc.me.parentEmailSet.useMutation({
        onSuccess: async () => {
            setEmail("")
            toast.success("Parent email saved")
            await utils.me.parentEmailGet.invalidate()
        },
        onError: (err) => {
            toast.error(err.message || "Could not save parent email")
        },
    })

    const saving = saveMutation.isPending

    function saveParentEmail() {
        saveMutation.mutate({ parentEmail: email })
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
