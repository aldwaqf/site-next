'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { contentsApi } from '@/lib/services';

interface Article {
    type: string;
    id: string;
    slug: string;
    featuredImage?: string;
    publishedAt?: string;
    createdAt: string;
    translations: Array<{
        language: string;
        title: string;
        body: string;
        excerpt?: string;
    }>;
}

export default function NewsPage() {
    const t = useTranslations();
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('all');

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                // Tous les contenus publiés (articles ET événements)
                const res = await contentsApi.getAll({ lang: locale.toUpperCase(), limit: 20 });
                setArticles((res.data || []) as unknown as Article[]);
            } catch (error) {
                console.error('Error fetching articles:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchArticles();
    }, [locale]);

    const filteredArticles = selectedCategory === 'all'
        ? articles
        : articles.filter((a) => a.type === selectedCategory);

    const getTranslation = (article: Article) => {
        return article.translations?.find(tr => tr.language === locale.toUpperCase())
            || article.translations?.[0]
            || { title: t('news.untitled'), body: '', excerpt: '' };
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(locale === 'ar' ? 'ar-SA' : locale === 'en' ? 'en-US' : 'fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen py-16">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">{t('news.title')}</h1>
                    <p className="text-lg text-neutral-600">{t('news.subtitle')}</p>
                </div>

                {/* Filtres par type de contenu */}
                <div className="flex items-center justify-center gap-2 mb-10 flex-wrap">
                    {[
                        { id: 'all', label: 'all' },
                        { id: 'ARTICLE', label: 'articles' },
                        { id: 'EVENT', label: 'events' },
                    ].map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${selectedCategory === cat.id
                                ? 'bg-emerald-600 text-white'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                        >
                            {t(`news.categories.${cat.label}`)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto"></div>
                        <p className="mt-4 text-neutral-500">{t('common.loading')}</p>
                    </div>
                ) : articles.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="text-6xl mb-6">📰</div>
                        <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                            {t('news.empty.title')}
                        </h2>
                        <p className="text-neutral-600">
                            {t('news.empty.description')}
                        </p>
                    </div>
                ) : filteredArticles.length === 0 ? (
                    <div className="text-center py-16 text-neutral-500">
                        {t('news.empty.title')}
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredArticles.map((article) => {
                            const trans = getTranslation(article);
                            return (
                                <Link
                                    key={article.id}
                                    href={`/${locale}/news/${article.slug}`}
                                    className="card group cursor-pointer overflow-hidden hover:shadow-lg transition-all"
                                >
                                    <div className="h-48 bg-gradient-to-br from-neutral-100 to-neutral-50 flex items-center justify-center">
                                        {article.featuredImage ? (
                                            <img
                                                src={article.featuredImage}
                                                alt={trans.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-5xl">📰</span>
                                        )}
                                    </div>
                                    <div className="p-6">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-sm text-emerald-600 font-medium">
                                                {formatDate(article.publishedAt || article.createdAt)}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-semibold text-neutral-900 mb-2 group-hover:text-emerald-600 transition-colors">
                                            {trans.title}
                                        </h3>
                                        {trans.excerpt && (
                                            <p className="text-sm text-neutral-600 line-clamp-2">{trans.excerpt}</p>
                                        )}
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
