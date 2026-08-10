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

import axios from "axios"
import { useRef, useState, type ChangeEvent } from "react"
import Image from "next/image"
import { useFormContext, useWatch } from "react-hook-form"
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

function ImageUpload() {
    const { control, setValue } = useFormContext<ShopItemForm>()
    const imageUrl = useWatch({ control, name: "imageUrl" })
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState("")

    async function handleFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]

        if (!file) return
        try {
            const formData = new FormData()
            formData.append("file", file)

            await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            }).then((r) => {
                if (r.status !== 200) {
                    setUploadError("Upload failed")
                    return
                }

                setValue("imageUrl", r.data.url, {
                    shouldDirty: true,
                    shouldValidate: true,
                })
            })
        } catch {
            setUploadError("Upload failed")
        } finally {
            setUploading(false)
            event.target.value = ""
        }
    }

    return (
        <div className="grid gap-2">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
            />
            <Button
                type="button"
                variant="secondary"
                className="w-fit"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
            >
                {uploading ? "Uploading..." : "Upload image"}
            </Button>
            {uploadError && <p className={errorClassName}>{uploadError}</p>}
            {imageUrl && (
                <Image
                    src={imageUrl}
                    alt="Item image preview"
                    width={96}
                    height={96}
                    className="h-24 w-24 rounded-md border border-border object-cover"
                />
            )}
        </div>
    )
}

export default function ShopPage() {
    const [result, setResult] = useState("")

    async function createItem(values: ShopItemForm) {
        setResult("")

        try {
            const response = await axios.post("/api/shop", values)
            const body = await response.data

            setResult(JSON.stringify(body, null, 2))
        } catch {
            setResult("something blew up. oops. please try agian later or call support.")
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

            <ImageUpload />

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
