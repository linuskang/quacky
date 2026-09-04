"use client"

import axios from "axios"
import Image from "next/image"
import { useRef, useState, type ChangeEvent } from "react"
import { useFormContext, useWatch } from "react-hook-form"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Form } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export type ShopItemFormValues = {
    name: string
    description: string
    price: number
    available: boolean
    category: string
    featured: boolean
    stock: number
    imageUrl: string
}

type Props = {
    initialValues: ShopItemFormValues
    submitLabel: string
    onSubmit: (values: ShopItemFormValues) => Promise<void>
    onCancel?: () => void
}

const labelClassName =
    "flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none"
const errorClassName = "text-xs/relaxed text-destructive"

function ImageUpload() {
    const { control, setValue } = useFormContext<ShopItemFormValues>()
    const imageUrl = useWatch({ control, name: "imageUrl" })
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadError, setUploadError] = useState("")

    async function handleFile(event: ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        setUploadError("")
        try {
            const formData = new FormData()
            formData.append("file", file)
            const response = await axios.post("/api/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            })

            if (response.status !== 200) {
                setUploadError("Upload failed")
                return
            }

            setValue("imageUrl", response.data.url, {
                shouldDirty: true,
                shouldValidate: true,
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

export function ShopItemForm({
    initialValues,
    submitLabel,
    onSubmit,
    onCancel,
}: Props) {
    return (
        <Form<ShopItemFormValues>
            className="grid gap-3"
            formOptions={{ defaultValues: initialValues }}
            onSubmit={onSubmit}
        >
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

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
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
                        <Input type="number" min="0" step="1" />
                    </Form.Field>
                    <Form.Error name="price" className={errorClassName} />
                </div>
                <div>
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
                        <Input type="number" min="0" step="1" />
                    </Form.Field>
                    <Form.Error name="stock" className={errorClassName} />
                </div>
            </div>

            <Form.Label name="category" className={labelClassName}>
                Category
            </Form.Label>
            <Form.Field name="category" required>
                <Input />
            </Form.Field>
            <Form.Error name="category" className={errorClassName} />

            <Form.Label name="imageUrl" className={labelClassName}>
                Image URL
            </Form.Label>
            <Form.Field name="imageUrl" required>
                <Input type="url" />
            </Form.Field>
            <Form.Error name="imageUrl" className={errorClassName} />

            <ImageUpload />

            <div className="grid gap-2 sm:grid-cols-2">
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
            </div>

            <div className="flex flex-wrap gap-2">
                <Form.Submit>
                    {({ isLoading }) => (
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? "Saving..." : submitLabel}
                        </Button>
                    )}
                </Form.Submit>
                {onCancel && (
                    <Button type="button" variant="secondary" onClick={onCancel}>
                        Cancel
                    </Button>
                )}
            </div>
        </Form>
    )
}
