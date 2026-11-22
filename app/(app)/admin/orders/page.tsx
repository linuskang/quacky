"use client";

import { PageLayout } from "@/components/page-layout";
import Loading from "@/components/loading";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function AdminOrdersPage() {
    const utils = trpc.useUtils();
    const { data: pendingOrders = [], isLoading: loading } =
        trpc.admin.ordersList.useQuery();

    const updateOrderMutation = trpc.admin.ordersUpdateStatus.useMutation({
        onSuccess: async (_data, variables) => {
            await Promise.all([
                utils.admin.ordersList.invalidate(),
                utils.shop.myOrders.invalidate(),
                utils.shop.list.invalidate(),
            ]);
            toast.success(
                variables.actionOrderStatus === "FULFILLED"
                    ? `Order ${variables.orderId} marked as fulfilled.`
                    : `Order ${variables.orderId} rejected.`,
                { duration: 3000 }
            );
        },
        onError: () => {
            toast.error("Failed to update order status.");
        },
    });

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
                                    disabled={updateOrderMutation.isPending}
                                    onClick={() => {
                                        updateOrderMutation.mutate({
                                            orderId: order.id,
                                            actionOrderStatus: "FULFILLED",
                                        });
                                    }}
                                >
                                    Mark as Fulfilled
                                </Button>

                                <Button
                                    variant="destructive"
                                    disabled={updateOrderMutation.isPending}
                                    onClick={() => {
                                        updateOrderMutation.mutate({
                                            orderId: order.id,
                                            actionOrderStatus: "REJECTED",
                                        });
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