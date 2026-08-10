"use client"

import axios from "axios"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useCallback, useEffect, useState, useSyncExternalStore } from "react"
import { toast } from "sonner"

import Loading from "../../loading"
import { authClient } from "@/client/auth"
import { PageCenter, PageLayout } from "@/components/page-layout"
import {
    ShopItemForm,
    type ShopItemFormValues,
} from "@/components/shop-item-form"
import { Title } from "@/components/text"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type ShopItem = {
    id: string
    name: string
    description: string
    imageUrl: string
    price: number
    stock: number
    category: string
    available: boolean
    featured: boolean
}

type ItemForm = ShopItemFormValues

const emptyForm: ItemForm = {
    name: "",
    description: "",
    imageUrl: "",
    price: 0,
    stock: 0,
    category: "",
    available: true,
    featured: false,
}

const subscribe = () => () => {}

export default function AdminShopItemsPage() {
    const { data: session, isPending } = authClient.useSession()
    const hydrated = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
    const [items, setItems] = useState<ShopItem[]>([])
    const [form, setForm] = useState<ItemForm>(emptyForm)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    const loadItems = useCallback(async () => {
        try {
            const response = await axios.get("/api/admin/shop-items")
            setItems(response.data.data ?? [])
        } catch {
            toast.error("Could not load shop items.")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        if (!hydrated || isPending || session?.user.role !== "admin") return
        void Promise.resolve().then(loadItems)
    }, [hydrated, isPending, loadItems, session])

    if (!hydrated || isPending) return <Loading />
    if (!session) redirect("/auth/login")
    if (session.user.role !== "admin") {
        return (
            <PageLayout>
                <PageCenter>
                    <Title>Access Denied</Title>
                    <p className="text-sm text-muted-foreground">
                        You do not have permission to access this page.
                    </p>
                </PageCenter>
            </PageLayout>
        )
    }

    if (loading) return <Loading />

    function editItem(item: ShopItem) {
        setEditingId(item.id)
        setForm({
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            price: item.price,
            stock: item.stock,
            category: item.category,
            available: item.available,
            featured: item.featured,
        })
        window.scrollTo({ top: 0, behavior: "smooth" })
    }

    function resetForm() {
        setEditingId(null)
        setForm(emptyForm)
    }

    async function saveItem(values: ShopItemFormValues) {
        try {
            if (editingId) {
                await axios.patch("/api/admin/shop-items", {
                    id: editingId,
                    ...values,
                })
                toast.success("Shop item updated.")
            } else {
                await axios.post("/api/admin/shop-items", values)
                toast.success("Shop item created.")
            }
            resetForm()
            setLoading(true)
            await loadItems()
        } catch {
            toast.error("Could not save shop item.")
        }
    }

    async function deleteItem(item: ShopItem) {
        if (!window.confirm(`Delete ${item.name}? Existing orders will also be removed.`)) {
            return
        }

        try {
            await axios.delete("/api/admin/shop-items", { data: { id: item.id } })
            setItems((current) => current.filter(({ id }) => id !== item.id))
            if (editingId === item.id) resetForm()
            toast.success("Shop item deleted.")
        } catch {
            toast.error("Could not delete shop item.")
        }
    }

    return (
        <PageLayout>
            <PageCenter className="max-w-6xl gap-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Title>Shop Items</Title>
                    <Link href="/admin" className="text-sm font-bold underline">
                        Back to admin panel
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>{editingId ? "Edit shop item" : "Add shop item"}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ShopItemForm
                            key={editingId ?? "new"}
                            initialValues={form}
                            submitLabel={editingId ? "Save changes" : "Create item"}
                            onSubmit={saveItem}
                            onCancel={editingId ? resetForm : undefined}
                        />
                    </CardContent>
                </Card>

                <div className="grid gap-4 md:grid-cols-2">
                    {items.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No shop items yet.</p>
                    ) : items.map((item) => (
                        <Card key={item.id} className="overflow-hidden">
                            <CardContent className="grid gap-3 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <h2 className="truncate font-bold">{item.name}</h2>
                                        <p className="text-sm text-muted-foreground">{item.category} · {item.price} points · {item.stock} in stock</p>
                                    </div>
                                    <span className="shrink-0 text-xs font-semibold">{item.available ? "Available" : "Hidden"}</span>
                                </div>
                                <p className="line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
                                <div className="flex gap-2">
                                    <Button type="button" variant="secondary" onClick={() => editItem(item)}>Edit</Button>
                                    <Button type="button" variant="destructive" onClick={() => void deleteItem(item)}>Delete</Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </PageCenter>
        </PageLayout>
    )
}
