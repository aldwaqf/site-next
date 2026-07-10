'use client';

// Formulaire d'article partagé entre création et édition.
// Un onglet par langue, chacun avec titre + résumé + éditeur riche.

import { useState } from 'react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';
import RichTextEditor from './RichTextEditor';

const LANGS = ['FR', 'EN', 'AR'] as const;
type Lang = (typeof LANGS)[number];
const langLabels: Record<Lang, string> = { FR: '🇫🇷 Français', EN: '🇬🇧 English', AR: '🇸🇦 العربية' };

export interface ArticleTranslationDraft {
    title: string;
    excerpt: string;
    body: string;
}

export interface ArticleDraft {
    type: 'ARTICLE' | 'EVENT';
    featuredImage: string;
    isPublished: boolean;
    translations: Record<Lang, ArticleTranslationDraft>;
}

export const emptyArticleDraft: ArticleDraft = {
    type: 'ARTICLE',
    featuredImage: '',
    isPublished: true,
    translations: {
        FR: { title: '', excerpt: '', body: '' },
        EN: { title: '', excerpt: '', body: '' },
        AR: { title: '', excerpt: '', body: '' },
    },
};

interface ArticleFormProps {
    initial: ArticleDraft;
    saving: boolean;
    submitLabel: string;
    onSubmit: (draft: ArticleDraft) => void;
}

export default function ArticleForm({ initial, saving, submitLabel, onSubmit }: ArticleFormProps) {
    const [draft, setDraft] = useState<ArticleDraft>(initial);
    const [activeLang, setActiveLang] = useState<Lang>('FR');
    const [error, setError] = useState('');

    const updateTranslation = (lang: Lang, field: keyof ArticleTranslationDraft, value: string) => {
        setDraft((prev) => ({
            ...prev,
            translations: { ...prev.translations, [lang]: { ...prev.translations[lang], [field]: value } },
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        const fr = draft.translations.FR;
        if (!fr.title || !fr.body || fr.body === '<p></p>') {
            setError('Le titre et le contenu en français sont obligatoires.');
            setActiveLang('FR');
            return;
        }
        onSubmit(draft);
    };

    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none';
    const current = draft.translations[activeLang];

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">{error}</div>}

            {/* Onglets langues */}
            <div className="flex gap-2 border-b border-neutral-100 pb-3">
                {LANGS.map((lang) => {
                    const filled = draft.translations[lang].title && draft.translations[lang].body;
                    return (
                        <button key={lang} type="button" onClick={() => setActiveLang(lang)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeLang === lang
                                    ? 'bg-emerald-600 text-white'
                                    : filled
                                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                        : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                            }`}>
                            {langLabels[lang]}{filled && activeLang !== lang ? ' ✓' : ''}
                        </button>
                    );
                })}
            </div>

            <div key={activeLang} className="space-y-4" dir={activeLang === 'AR' ? 'rtl' : 'ltr'}>
                <input type="text" className={inputClass}
                    placeholder={activeLang === 'FR' ? "Titre de l'article" : activeLang === 'EN' ? 'Article title' : 'عنوان المقال'}
                    value={current.title}
                    onChange={(e) => updateTranslation(activeLang, 'title', e.target.value)} />
                <input type="text" className={inputClass}
                    placeholder={activeLang === 'FR' ? 'Résumé (affiché dans les listes)' : activeLang === 'EN' ? 'Excerpt (shown in lists)' : 'ملخص'}
                    value={current.excerpt}
                    onChange={(e) => updateTranslation(activeLang, 'excerpt', e.target.value)} />
                <RichTextEditor
                    value={current.body}
                    dir={activeLang === 'AR' ? 'rtl' : 'ltr'}
                    onChange={(html) => updateTranslation(activeLang, 'body', html)} />
            </div>

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Image de couverture</label>
                {draft.featuredImage ? (
                    <div className="space-y-3">
                        <Image src={draft.featuredImage} alt="Couverture" width={640} height={360}
                            className="rounded-xl object-cover w-full h-48" />
                        <button type="button" onClick={() => setDraft({ ...draft, featuredImage: '' })}
                            className="text-sm text-red-600 hover:underline">Retirer l&apos;image</button>
                    </div>
                ) : (
                    <CldUploadWidget
                        signatureEndpoint="/api/upload/signature"
                        options={{ folder: 'site-next/articles', maxFiles: 1, resourceType: 'image' }}
                        onSuccess={(result) => {
                            const info = result?.info;
                            if (info && typeof info === 'object' && 'secure_url' in info) {
                                setDraft((prev) => ({ ...prev, featuredImage: info.secure_url as string }));
                            }
                        }}>
                        {({ open }) => (
                            <button type="button" onClick={() => open()}
                                className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                Cliquer pour ajouter une image de couverture
                            </button>
                        )}
                    </CldUploadWidget>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-8">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-neutral-700">Type :</span>
                    {([['ARTICLE', 'Article'], ['EVENT', 'Événement']] as const).map(([value, label]) => (
                        <button key={value} type="button"
                            onClick={() => setDraft({ ...draft, type: value })}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                draft.type === value
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}>
                            {label}
                        </button>
                    ))}
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={draft.isPublished}
                        onChange={(e) => setDraft({ ...draft, isPublished: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 text-emerald-600" />
                    <span className="text-neutral-700">Publié (visible sur le site)</span>
                </label>
            </div>

            <button type="submit" disabled={saving}
                className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {saving ? 'Sauvegarde...' : submitLabel}
            </button>
        </form>
    );
}
