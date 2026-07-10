'use client';

// Liste des dons côté admin (tous statuts).

import { useEffect, useState } from 'react';

interface AdminDonation {
    id: string;
    amount: number;
    donorName?: string | null;
    donorPhone?: string | null;
    donorEmail?: string | null;
    isAnonymous: boolean;
    createdAt: string;
    project?: { slug: string } | null;
    campaign?: { slug: string } | null;
    user?: { email: string } | null;
    transaction?: { status: string; paymentMethod: string; externalId?: string | null } | null;
}

const statusBadges: Record<string, string> = {
    SUCCESS: 'bg-emerald-100 text-emerald-700',
    PENDING: 'bg-amber-100 text-amber-700',
    FAILED: 'bg-red-100 text-red-600',
    CANCELLED: 'bg-neutral-200 text-neutral-500',
    REFUNDED: 'bg-blue-100 text-blue-700',
};

export default function AdminDonationsPage() {
    const [donations, setDonations] = useState<AdminDonation[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/donations?limit=50')
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((json) => {
                setDonations(json.data);
                setTotal(json.meta.total);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Dons</h1>
            <p className="text-neutral-500 mb-8">{total} don(s) enregistré(s), tous statuts confondus.</p>

            {loading ? (
                <div className="h-64 bg-white rounded-2xl animate-pulse" />
            ) : (
                <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-neutral-500 border-b border-neutral-100">
                                <th className="px-5 py-4 font-medium">Date</th>
                                <th className="px-5 py-4 font-medium">Donateur</th>
                                <th className="px-5 py-4 font-medium">Montant</th>
                                <th className="px-5 py-4 font-medium">Méthode</th>
                                <th className="px-5 py-4 font-medium">Affectation</th>
                                <th className="px-5 py-4 font-medium">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-neutral-50">
                            {donations.map((d) => (
                                <tr key={d.id} className="hover:bg-neutral-50">
                                    <td className="px-5 py-4 whitespace-nowrap text-neutral-500">
                                        {new Date(d.createdAt).toLocaleDateString('fr-FR')}
                                    </td>
                                    <td className="px-5 py-4">
                                        <p className="font-medium text-neutral-900">
                                            {d.isAnonymous ? 'Anonyme' : d.donorName || d.user?.email || '—'}
                                        </p>
                                        <p className="text-xs text-neutral-400">{d.donorPhone || d.donorEmail || ''}</p>
                                    </td>
                                    <td className="px-5 py-4 font-semibold whitespace-nowrap">
                                        {d.amount.toLocaleString('fr-FR')} F
                                    </td>
                                    <td className="px-5 py-4 text-neutral-500">{d.transaction?.paymentMethod ?? '—'}</td>
                                    <td className="px-5 py-4 text-neutral-500">
                                        {d.project?.slug || d.campaign?.slug || 'Don général'}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusBadges[d.transaction?.status ?? ''] ?? 'bg-neutral-100 text-neutral-500'}`}>
                                            {d.transaction?.status ?? '—'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {donations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-neutral-500">
                                        Aucun don pour le moment.
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
