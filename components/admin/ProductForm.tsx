'use client';

// Formulaire produit partagé entre création et édition.

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { CldUploadWidget } from 'next-cloudinary';

const LANGS = ['FR', 'EN', 'AR'] as const;
type Lang = (typeof LANGS)[number];
const langLabels: Record<Lang, string> = { FR: '🇫🇷 Français', EN: '🇬🇧 English', AR: '🇸🇦 العربية' };

export interface ProductDraft {
    price: string;
    stock: string;
    images: string[];
    isActive: boolean;
    isFeatured: boolean;
    categoryIds: string[];
    translations: Record<Lang, { name: string; description: string }>;
}

export const emptyProductDraft: ProductDraft = {
    price: '',
    stock: '0',
    images: [],
    isActive: true,
    isFeatured: false,
    categoryIds: [],
    translations: {
        FR: { name: '', description: '' },
        EN: { name: '', description: '' },
        AR: { name: '', description: '' },
    },
};

interface Category {
    id: string;
    translations: Array<{ language: string; name: string }>;
}

interface ProductFormProps {
    initial: ProductDraft;
    saving: boolean;
    submitLabel: string;
    onSubmit: (draft: ProductDraft) => void;
}

export default function ProductForm({ initial, saving, submitLabel, onSubmit }: ProductFormProps) {
    const [draft, setDraft] = useState<ProductDraft>(initial);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activeLang, setActiveLang] = useState<Lang>('FR');
    const [error, setError] = useState('');

    useEffect(() => {
        fetch('/api/products/categories')
            .then((res) => res.json())
            .then(setCategories)
            .catch(console.error);
    }, []);

    const updateTranslation = (lang: Lang, field: 'name' | 'description', value: string) => {
        setDraft((prev) => ({
            ...prev,
            translations: { ...prev.translations, [lang]: { ...prev.translations[lang], [field]: value } },
        }));
    };

    const toggleCategory = (id: string) => {
        setDraft((prev) => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(id)
                ? prev.categoryIds.filter((c) => c !== id)
                : [...prev.categoryIds, id],
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!draft.translations.FR.name) {
            setError('Le nom du produit en français est obligatoire.');
            setActiveLang('FR');
            return;
        }
        if (!Number(draft.price) || Number(draft.price) <= 0) {
            setError('Prix invalide.');
            return;
        }
        onSubmit(draft);
    };

    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none';
    const current = draft.translations[activeLang];
    const catName = (c: Category) =>
        c.translations.find((t) => t.language === 'FR')?.name || c.translations[0]?.name || c.id;

    return (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
            {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">{error}</div>}

            <div className="flex gap-2 border-b border-neutral-100 pb-3">
                {LANGS.map((lang) => (
                    <button key={lang} type="button" onClick={() => setActiveLang(lang)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            activeLang === lang ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                        }`}>
                        {langLabels[lang]}{draft.translations[lang].name && activeLang !== lang ? ' ✓' : ''}
                    </button>
                ))}
            </div>

            <div key={activeLang} className="space-y-4" dir={activeLang === 'AR' ? 'rtl' : 'ltr'}>
                <input type="text" className={inputClass}
                    placeholder={activeLang === 'FR' ? 'Nom du produit' : activeLang === 'EN' ? 'Product name' : 'اسم المنتج'}
                    value={current.name}
                    onChange={(e) => updateTranslation(activeLang, 'name', e.target.value)} />
                <textarea rows={3} className={inputClass}
                    placeholder={activeLang === 'FR' ? 'Description' : activeLang === 'EN' ? 'Description' : 'الوصف'}
                    value={current.description}
                    onChange={(e) => updateTranslation(activeLang, 'description', e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Prix (FCFA)</label>
                    <input type="number" min="1" className={inputClass}
                        value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
                </div>
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Stock</label>
                    <input type="number" min="0" className={inputClass}
                        value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
                </div>
            </div>

            {categories.length > 0 && (
                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Catégories</label>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    draft.categoryIds.includes(cat.id)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                                }`}>
                                {catName(cat)}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Photos du produit</label>
                <div className="grid grid-cols-3 gap-3">
                    {draft.images.map((img, i) => (
                        <div key={i} className="relative group">
                            <Image src={img} alt={`Photo ${i + 1}`} width={200} height={150}
                                className="rounded-xl object-cover w-full h-28" />
                            <button type="button"
                                onClick={() => setDraft({ ...draft, images: draft.images.filter((_, j) => j !== i) })}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                ✕
                            </button>
                        </div>
                    ))}
                    <CldUploadWidget
                        signatureEndpoint="/api/upload/signature"
                        options={{ folder: 'site-next/products', maxFiles: 5, resourceType: 'image' }}
                        onSuccess={(result) => {
                            const info = result?.info;
                            if (info && typeof info === 'object' && 'secure_url' in info) {
                                setDraft((prev) => ({ ...prev, images: [...prev.images, info.secure_url as string] }));
                            }
                        }}>
                        {({ open }) => (
                            <button type="button" onClick={() => open()}
                                className="h-28 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-400 hover:border-emerald-500 hover:text-emerald-600 transition-colors text-sm">
                                + Ajouter
                            </button>
                        )}
                    </CldUploadWidget>
                </div>
            </div>

            <div className="flex gap-8">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={draft.isActive}
                        onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 text-emerald-600" />
                    <span className="text-neutral-700">En vente</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={draft.isFeatured}
                        onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })}
                        className="w-4 h-4 rounded border-neutral-300 text-emerald-600" />
                    <span className="text-neutral-700">Mis en avant</span>
                </label>
            </div>

            <button type="submit" disabled={saving}
                className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                {saving ? 'Sauvegarde...' : submitLabel}
            </button>
        </form>
    );
}
