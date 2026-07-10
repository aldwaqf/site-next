'use client';

// Création d'une actualité.

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArticleForm, { emptyArticleDraft, type ArticleDraft } from '@/components/admin/ArticleForm';

function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function NewArticlePage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const router = useRouter();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (draft: ArticleDraft) => {
        setError('');
        setSaving(true);
        try {
            const translations = (['FR', 'EN', 'AR'] as const)
                .filter((lang) => draft.translations[lang].title && draft.translations[lang].body && draft.translations[lang].body !== '<p></p>')
                .map((lang) => ({
                    language: lang,
                    title: draft.translations[lang].title,
                    body: draft.translations[lang].body,
                    excerpt: draft.translations[lang].excerpt || undefined,
                }));

            const res = await fetch('/api/contents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: slugify(draft.translations.FR.title),
                    type: 'ARTICLE',
                    featuredImage: draft.featuredImage || null,
                    isPublished: draft.isPublished,
                    translations,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Erreur lors de la création');
            router.push(`/${locale}/admin/articles`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la création');
            setSaving(false);
        }
    };

    return (
        <div className="max-w-3xl">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Nouvel article</h1>
            <p className="text-neutral-500 mb-8">Rédige en français, ajoute les autres langues si tu veux.</p>
            {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>}
            <ArticleForm initial={emptyArticleDraft} saving={saving} submitLabel="Publier l'article" onSubmit={handleSubmit} />
        </div>
    );
}
