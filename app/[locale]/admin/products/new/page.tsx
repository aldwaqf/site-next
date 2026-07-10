'use client';

// Création d'un produit boutique.

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ProductForm, { emptyProductDraft, type ProductDraft } from '@/components/admin/ProductForm';

function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function NewProductPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (draft: ProductDraft) => {
        setError('');
        setSaving(true);
        try {
            const translations = (['FR', 'EN', 'AR'] as const)
                .filter((lang) => draft.translations[lang].name)
                .map((lang) => ({
                    language: lang,
                    name: draft.translations[lang].name,
                    description: draft.translations[lang].description || undefined,
                }));

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: slugify(draft.translations.FR.name),
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
            if (!res.ok) throw new Error(data?.error || 'Erreur lors de la création');
            router.push(`/${locale}/admin/products`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la création');
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Nouveau produit</h1>
            <p className="text-neutral-500 mb-8">Ajoute un produit à la boutique solidaire.</p>
            {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>}
            <ProductForm initial={emptyProductDraft} saving={saving} submitLabel="Ajouter le produit" onSubmit={handleSubmit} />
        </div>
    );
}
