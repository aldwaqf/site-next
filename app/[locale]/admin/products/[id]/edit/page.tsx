'use client';

// Édition d'un produit existant.

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm, { emptyProductDraft, type ProductDraft } from '@/components/admin/ProductForm';

export default function EditProductPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const productId = params.id as string;
    const router = useRouter();

    const [initial, setInitial] = useState<ProductDraft | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetch(`/api/products/${productId}`)
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((p) => {
                const draft: ProductDraft = {
                    ...emptyProductDraft,
                    price: String(p.price),
                    stock: String(p.stock),
                    images: p.images ?? [],
                    isActive: p.isActive,
                    isFeatured: p.isFeatured ?? false,
                    categoryIds: (p.categories ?? []).map((c: { categoryId: string }) => c.categoryId),
                    translations: { ...emptyProductDraft.translations },
                };
                for (const t of p.translations ?? []) {
                    if (t.language in draft.translations) {
                        draft.translations[t.language as 'FR' | 'EN' | 'AR'] = {
                            name: t.name ?? '',
                            description: t.description ?? '',
                        };
                    }
                }
                setInitial(draft);
            })
            .catch(() => setError('Produit introuvable.'));
    }, [productId]);

    const handleSubmit = async (draft: ProductDraft) => {
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            const translations = (['FR', 'EN', 'AR'] as const)
                .filter((lang) => draft.translations[lang].name)
                .map((lang) => ({
                    language: lang,
                    name: draft.translations[lang].name,
                    description: draft.translations[lang].description || undefined,
                }));

            const res = await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    price: Number(draft.price),
                    stock: Number(draft.stock) || 0,
                    images: draft.images,
                    isActive: draft.isActive,
                    isFeatured: draft.isFeatured,
                    categoryIds: draft.categoryIds,
                    translations,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Erreur lors de la sauvegarde');
            setSuccess('Produit mis à jour !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Supprimer ce produit ? (il sera masqué s\'il a déjà été commandé)')) return;
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        if (res.ok) {
            router.push(`/${locale}/admin/products`);
        } else {
            setError('Suppression impossible.');
        }
    };

    if (error && !initial) {
        return <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">{error}</div>;
    }
    if (!initial) {
        return <div className="h-64 bg-white rounded-2xl animate-pulse" />;
    }

    return (
        <div className="max-w-3xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-1">Modifier le produit</h1>
                    <p className="text-neutral-500">{initial.translations.FR.name}</p>
                </div>
                <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
                    Supprimer
                </button>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl mb-6">{success}</div>}
            <ProductForm initial={initial} saving={saving} submitLabel="Enregistrer" onSubmit={handleSubmit} />
        </div>
    );
}
