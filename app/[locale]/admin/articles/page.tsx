'use client';

// Liste des actualités côté admin.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';

interface AdminArticle {
    id: string;
    slug: string;
    type: string;
    featuredImage?: string | null;
    isPublished: boolean;
    publishedAt?: string | null;
    createdAt: string;
    translations: Array<{ language: string; title: string }>;
}

export default function AdminArticlesPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const [articles, setArticles] = useState<AdminArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Vue admin : on veut aussi les brouillons → on passe par l'API publique
        // (publiés) puis on complètera avec un paramètre admin si besoin.
        fetch('/api/contents?type=ARTICLE&limit=50')
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((json) => setArticles(json.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getTitle = (a: AdminArticle) =>
        a.translations.find((t) => t.language === 'FR')?.title || a.translations[0]?.title || a.slug;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-1">Actualités</h1>
                    <p className="text-neutral-500">{articles.length} article(s) publié(s).</p>
                </div>
                <Link href={`/${locale}/admin/articles/new`} className="btn-primary px-5 py-3">
                    + Nouvel article
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100 overflow-hidden">
                    {articles.map((article) => (
                        <div key={article.id} className="p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                            <div className="w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 relative">
                                {article.featuredImage && (
                                    <Image src={article.featuredImage} alt="" fill className="object-cover" sizes="64px" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-900 truncate">{getTitle(article)}</p>
                                <p className="text-sm text-neutral-500">
                                    {new Date(article.publishedAt || article.createdAt).toLocaleDateString('fr-FR')} · {article.translations.length} langue(s)
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${article.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                    {article.isPublished ? 'Publié' : 'Brouillon'}
                                </span>
                                <Link href={`/${locale}/admin/articles/${article.id}/edit`}
                                    className="ml-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                    Modifier
                                </Link>
                            </div>
                        </div>
                    ))}
                    {articles.length === 0 && (
                        <div className="p-12 text-center text-neutral-500">Aucun article pour le moment.</div>
                    )}
                </div>
            )}
        </div>
    );
}
