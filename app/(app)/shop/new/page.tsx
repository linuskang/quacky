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

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ShopPage() {
    const [result, setResult] = useState("")
    const [pending, setPending] = useState(false)

    async function createItem(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setPending(true)
        setResult("")

        const formData = new FormData(event.currentTarget)

        try {
            const response = await fetch("/api/shop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: formData.get("name"),
                    description: formData.get("description"),
                    price: Number(formData.get("price")),
                    available: formData.has("available"),
                    category: formData.get("category"),
                    featured: formData.has("featured"),
                    stock: Number(formData.get("stock")),
                    imageUrl: formData.get("imageUrl"),
                }),
            })
            const body = await response.text()

            try {
                setResult(
                    `${response.status} ${response.statusText}\n${JSON.stringify(JSON.parse(body), null, 2)}`
                )
            } catch {
                setResult(`${response.status} ${response.statusText}\n${body}`)
            }
        } catch (error) {
            setResult(error instanceof Error ? error.message : "Request failed")
        } finally {
            setPending(false)
        }
    }

    return (
        <form onSubmit={createItem} className="grid gap-3 p-4">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required />

            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />

            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" type="number" step="any" required />

            <Label htmlFor="category">Category</Label>
            <Input id="category" name="category" required />

            <Label htmlFor="stock">Stock</Label>
            <Input id="stock" name="stock" type="number" required />

            <Label htmlFor="imageUrl">Image URL</Label>
            <Input id="imageUrl" name="imageUrl" type="url" required />

            <Label className="flex items-center gap-2">
                <Checkbox name="available" defaultChecked /> Available
            </Label>
            <Label className="flex items-center gap-2">
                <Checkbox name="featured" /> Featured
            </Label>

            <Button type="submit" disabled={pending} className="w-fit">
                {pending ? "Creating..." : "Create item"}
            </Button>

            {result && (
                <pre className="overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                    {result}
                </pre>
            )}
        </form>
    )
}
