'use client';

// Édition d'une actualité existante.

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ArticleForm, { emptyArticleDraft, type ArticleDraft } from '@/components/admin/ArticleForm';

export default function EditArticlePage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const articleId = params.id as string;
    const router = useRouter();

    const [initial, setInitial] = useState<ArticleDraft | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetch(`/api/contents/${articleId}`)
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((c) => {
                const draft: ArticleDraft = {
                    ...emptyArticleDraft,
                    featuredImage: c.featuredImage || '',
                    isPublished: c.isPublished,
                    translations: { ...emptyArticleDraft.translations },
                };
                for (const t of c.translations ?? []) {
                    if (t.language in draft.translations) {
                        draft.translations[t.language as 'FR' | 'EN' | 'AR'] = {
                            title: t.title ?? '',
                            excerpt: t.excerpt ?? '',
                            body: t.body ?? '',
                        };
                    }
                }
                setInitial(draft);
            })
            .catch(() => setError('Article introuvable.'));
    }, [articleId]);

    const handleSubmit = async (draft: ArticleDraft) => {
        setError('');
        setSuccess('');
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

            const res = await fetch(`/api/contents/${articleId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    featuredImage: draft.featuredImage || null,
                    isPublished: draft.isPublished,
                    translations,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Erreur lors de la sauvegarde');
            setSuccess('Article mis à jour !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Supprimer définitivement cet article ?')) return;
        const res = await fetch(`/api/contents/${articleId}`, { method: 'DELETE' });
        if (res.ok) {
            router.push(`/${locale}/admin/articles`);
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
                    <h1 className="text-2xl font-bold text-neutral-900 mb-1">Modifier l&apos;article</h1>
                    <p className="text-neutral-500">{initial.translations.FR.title}</p>
                </div>
                <button type="button" onClick={handleDelete} className="text-sm text-red-600 hover:underline">
                    Supprimer
                </button>
            </div>
            {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl mb-6">{error}</div>}
            {success && <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl mb-6">{success}</div>}
            <ArticleForm initial={initial} saving={saving} submitLabel="Enregistrer" onSubmit={handleSubmit} />
        </div>
    );
}
