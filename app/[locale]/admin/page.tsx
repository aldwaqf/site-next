'use client';

// Tableau de bord admin : chiffres clés et raccourcis.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface AdminStats {
    donations: { confirmed: number; pending: number; totalAmount: number };
    orders: { total: number; confirmed: number };
    projects: number;
    products: number;
    users: number;
}

export default function AdminHomePage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/admin/stats')
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then(setStats)
            .catch(() => setError('Impossible de charger les statistiques.'));
    }, []);

    const cards = stats
        ? [
              { label: 'Dons confirmés', value: stats.donations.confirmed, sub: `${stats.donations.totalAmount.toLocaleString('fr-FR')} FCFA collectés`, href: '/admin/donations' },
              { label: 'Dons en attente', value: stats.donations.pending, sub: 'paiement non finalisé', href: '/admin/donations' },
              { label: 'Commandes', value: stats.orders.total, sub: `${stats.orders.confirmed} confirmées`, href: '/admin/orders' },
              { label: 'Projets', value: stats.projects, sub: 'en base', href: '/admin/projects' },
              { label: 'Produits', value: stats.products, sub: 'boutique', href: '/admin/orders' },
              { label: 'Utilisateurs', value: stats.users, sub: 'comptes', href: '/admin' },
          ]
        : [];

    return (
        <div>
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Tableau de bord</h1>
            <p className="text-neutral-500 mb-8">Vue d&apos;ensemble de la plateforme.</p>

            {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>}

            {!stats && !error && (
                <div className="grid md:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />
                    ))}
                </div>
            )}

            <div className="grid md:grid-cols-3 gap-5">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        href={`/${locale}${card.href}`}
                        className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <p className="text-sm text-neutral-500 mb-1">{card.label}</p>
                        <p className="text-3xl font-bold text-neutral-900">{card.value.toLocaleString('fr-FR')}</p>
                        <p className="text-xs text-neutral-400 mt-1">{card.sub}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
