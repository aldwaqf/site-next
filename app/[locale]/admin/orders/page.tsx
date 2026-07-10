'use client';

// Liste des commandes boutique côté admin.

import { useEffect, useState } from 'react';

interface AdminOrder {
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    customerName: string;
    customerEmail: string;
    customerPhone?: string | null;
    createdAt: string;
    items: Array<{
        quantity: number;
        price: number;
        product?: { slug: string; translations?: Array<{ name: string }> } | null;
    }>;
}

const statusBadges: Record<string, string> = {
    CONFIRMED: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    PROCESSING: 'bg-blue-100 text-blue-700',
    SHIPPED: 'bg-indigo-100 text-indigo-700',
    DELIVERED: 'bg-emerald-100 text-emerald-700',
    CANCELLED: 'bg-neutral-200 text-neutral-500',
};

export default function AdminOrdersPage() {
    const [orders, setOrders] = useState<AdminOrder[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/orders?limit=50')
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((json) => {
                setOrders(json.data);
                setTotal(json.meta.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Commandes</h1>
            <p className="text-neutral-500 mb-8">{total} commande(s) boutique.</p>

            {loading ? (
                <div className="h-64 bg-white rounded-2xl animate-pulse" />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-neutral-500 border-b border-neutral-100">
                                <th className="px-5 py-4 font-medium">N° commande</th>
                                <th className="px-5 py-4 font-medium">Client</th>
                                <th className="px-5 py-4 font-medium">Articles</th>
                                <th className="px-5 py-4 font-medium">Total</th>
                                <th className="px-5 py-4 font-medium">Date</th>
                                <th className="px-5 py-4 font-medium">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-neutral-50">
                                    <td className="px-5 py-4 font-mono text-xs whitespace-nowrap">{order.orderNumber}</td>
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-neutral-900">{order.customerName}</p>
                                        <p className="text-xs text-neutral-400">{order.customerPhone || order.customerEmail}</p>
                                    </td>
                                    <td className="px-5 py-4 text-neutral-500">
                                        {order.items.map((item, i) => (
                                            <p key={i}>
                                                {item.quantity} × {item.product?.translations?.[0]?.name || item.product?.slug || 'Produit'}
                                            </p>
                                        ))}
                                    </td>
                                    <td className="px-5 py-4 font-semibold whitespace-nowrap">
                                        {order.total.toLocaleString('fr-FR')} F
                                    </td>
                                    <td className="px-5 py-4 whitespace-nowrap text-neutral-500">
                                        {new Date(order.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadges[order.status] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                                        Aucune commande pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
