"use client";

import axios from "axios";
import { PageLayout } from "@/components/page-layout";
import { useEffect, useState } from "react";
import Loading from "@/components/loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type Order = {
    id: string;
    status: "PENDING" | "FULFILLED" | "REJECTED";
    quantity: number;
    createdAt: string;
    item: {
        id: string;
        name: string;
        description: string;
        imageUrl: string;
        price: number;
        stock: number;
        category: string;
        available: boolean;
        featured: boolean;
    };
    user: {
        id: string;
        username: string;
        email: string;
    };
}

export default function AdminOrdersPage() {

    const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    async function loadPendingOrders() {
        axios.get("/api/admin/orders")
            .then((res) => setPendingOrders(res.data.data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }
    useEffect(() => {
        loadPendingOrders();
    }, []);

    return (
        <PageLayout>
            <h1 className="text-2xl font-extrabold">Admin Orders</h1>

            {loading ? (
                <Loading />
            ) : (
                <div className="mt-4 space-y-4">
                    {pendingOrders.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No pending orders. hooray!
                        </p>
                    ) : (
                        pendingOrders.map((order) => (
                            <div key={order.id} className="border rounded p-4">
                                <p><strong>Order ID:</strong> {order.id}</p>
                                <p><strong>Status:</strong> {order.status}</p>
                                <p><strong>Quantity:</strong> {order.quantity}</p>
                                <p><strong>Created At:</strong> {new Date(order.createdAt).toLocaleString()}</p>
                                <p><strong>Item Name:</strong> {order.item.name}</p>
                                <p><strong>Item Description:</strong> {order.item.description}</p>
                                <p><strong>Item Price:</strong> ${order.item.price.toFixed(2)}</p>
                                <p><strong>Requestor:</strong> <Link className="underline" href={`/@${order.user.username}`}>{order.user.username} ({order.user.email})</Link></p>

                                <Button
                                    variant="primary"
                                    onClick={async () => {
                                        await axios.post("/api/admin/orders", { orderId: order.id, actionOrderStatus: "FULFILLED" })

                                        loadPendingOrders();
                                        toast.success(`Order ${order.id} marked as fulfilled.`, { duration: 3000 });
                                    }}
                                >
                                    Mark as Fulfilled
                                </Button>

                                <Button
                                    variant="destructive"
                                    onClick={async () => {
                                        await axios.post("/api/admin/orders", { orderId: order.id, actionOrderStatus: "REJECTED" })
                                        loadPendingOrders();
                                        toast.success(`Order ${order.id} rejected.`, { duration: 3000 });
                                    }}
                                >
                                    Reject Order
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </PageLayout>
    );
}