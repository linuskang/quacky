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

import { useState, type ChangeEvent } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

type ShopItemForm = {
    name: string
    description: string
    price: number
    available: boolean
    category: string
    featured: boolean
    stock: number
    imageUrl: string
}

const labelClassName =
    "flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none"
const errorClassName = "text-xs/relaxed text-destructive"

export default function ShopPage() {
    const [result, setResult] = useState("")

    async function createItem(values: ShopItemForm) {
        setResult("")

        try {
            const response = await fetch("/api/shop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
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
        }
    }

    return (
        <Form<ShopItemForm>
            className="grid gap-3 p-4"
            formOptions={{
                defaultValues: { available: true, featured: false },
            }}
            onSubmit={createItem}
        >
            <Form.Title className="text-4xl font-semibold text-primary">
                Create a new shop item
            </Form.Title>
            <Form.Description className="sr-only">
                Enter the details for the new shop item.
            </Form.Description>

            <Form.Label name="name" className={labelClassName}>
                Name
            </Form.Label>
            <Form.Field name="name" required>
                <Input />
            </Form.Field>
            <Form.Error name="name" className={errorClassName} />

            <Form.Label name="description" className={labelClassName}>
                Description
            </Form.Label>
            <Form.Field name="description" required>
                <Textarea />
            </Form.Field>
            <Form.Error name="description" className={errorClassName} />

            <Form.Label name="price" className={labelClassName}>
                Price
            </Form.Label>
            <Form.Field
                name="price"
                required
                override={({ field }) => ({
                    onBlur: field.onBlur,
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(event.currentTarget.valueAsNumber),
                    value: field.value ?? "",
                })}
            >
                <Input type="number" step="any" />
            </Form.Field>
            <Form.Error name="price" className={errorClassName} />

            <Form.Label name="category" className={labelClassName}>
                Category
            </Form.Label>
            <Form.Field name="category" required>
                <Input />
            </Form.Field>
            <Form.Error name="category" className={errorClassName} />

            <Form.Label name="stock" className={labelClassName}>
                Stock
            </Form.Label>
            <Form.Field
                name="stock"
                required
                override={({ field }) => ({
                    onBlur: field.onBlur,
                    onChange: (event: ChangeEvent<HTMLInputElement>) =>
                        field.onChange(event.currentTarget.valueAsNumber),
                    value: field.value ?? "",
                })}
            >
                <Input type="number" />
            </Form.Field>
            <Form.Error name="stock" className={errorClassName} />

            <Form.Label name="imageUrl" className={labelClassName}>
                Image URL
            </Form.Label>
            <Form.Field name="imageUrl" required>
                <Input type="url" />
            </Form.Field>
            <Form.Error name="imageUrl" className={errorClassName} />

            <Form.Label name="available" className={labelClassName}>
                <Form.Field
                    name="available"
                    override={({ field }) => ({
                        checked: field.value,
                        onCheckedChange: field.onChange,
                    })}
                >
                    <Checkbox />
                </Form.Field>
                Available
            </Form.Label>
            <Form.Label name="featured" className={labelClassName}>
                <Form.Field
                    name="featured"
                    override={({ field }) => ({
                        checked: field.value,
                        onCheckedChange: field.onChange,
                    })}
                >
                    <Checkbox />
                </Form.Field>
                Featured
            </Form.Label>

            <Form.Submit>
                {({ isLoading }) => (
                    <Button className="w-fit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create item"}
                    </Button>
                )}
            </Form.Submit>

            {result && (
                <pre className="overflow-auto rounded-md border border-border bg-background p-3 text-xs">
                    {result}
                </pre>
            )}
        </Form>
    )
}
