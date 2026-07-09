'use client';

// Première page du back-office : création d'un projet.
// Interface volontairement simple, esprit "WordPress" : un formulaire,
// un bouton d'upload d'image, publier. (Back-office complet à l'Étape 8.)

import { useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CldUploadWidget } from 'next-cloudinary';
import { useAuth } from '@/lib/auth-context';

const cloudinaryReady = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY !== 'A_REMPLIR',
);

// "renovation-daara-thies" à partir de "Rénovation du daara de Thiès"
function slugify(text: string) {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

export default function NewProjectPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const router = useRouter();
    const { user, isAuthenticated, isLoading } = useAuth();

    const [form, setForm] = useState({
        titleFr: '',
        descriptionFr: '',
        shortDescFr: '',
        titleEn: '',
        descriptionEn: '',
        titleAr: '',
        descriptionAr: '',
        goalAmount: '',
        isUrgent: false,
        isFeatured: false,
    });
    const [featuredImage, setFeaturedImage] = useState('');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Garde côté client (confort UX). La vraie protection est sur l'API.
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-neutral-500">Chargement...</div>;
    }
    if (!isAuthenticated || user?.role !== 'ADMIN') {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-neutral-700">Accès réservé aux administrateurs.</p>
                <Link href={`/${locale}/login`} className="text-emerald-600 font-medium hover:underline">
                    Se connecter
                </Link>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!form.titleFr || !form.descriptionFr) {
            setError('Le titre et la description en français sont obligatoires.');
            return;
        }
        const goal = Number(form.goalAmount);
        if (!goal || goal <= 0) {
            setError('Objectif de collecte invalide.');
            return;
        }

        const translations = [
            { language: 'FR', title: form.titleFr, description: form.descriptionFr, shortDesc: form.shortDescFr || undefined },
        ];
        if (form.titleEn && form.descriptionEn) {
            translations.push({ language: 'EN', title: form.titleEn, description: form.descriptionEn, shortDesc: undefined });
        }
        if (form.titleAr && form.descriptionAr) {
            translations.push({ language: 'AR', title: form.titleAr, description: form.descriptionAr, shortDesc: undefined });
        }

        try {
            setSaving(true);
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    slug: slugify(form.titleFr),
                    goalAmount: goal,
                    featuredImage: featuredImage || undefined,
                    isUrgent: form.isUrgent,
                    isFeatured: form.isFeatured,
                    translations,
                }),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data?.error || 'Erreur lors de la création');
            }
            setSuccess(`Projet "${form.titleFr}" créé !`);
            setTimeout(() => router.push(`/${locale}`), 1500);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la création');
        } finally {
            setSaving(false);
        }
    };

    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none';

    return (
        <div className="min-h-screen py-16 bg-neutral-50">
            <div className="max-w-2xl mx-auto px-4">
                <h1 className="text-2xl font-semibold text-neutral-900 mb-2">Nouveau projet</h1>
                <p className="text-neutral-600 mb-8">Créer un projet de collecte visible sur le site.</p>

                <form onSubmit={handleSubmit} className="card p-8 bg-white rounded-2xl shadow-sm space-y-6">
                    {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">{error}</div>}
                    {success && <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl">{success}</div>}

                    <fieldset className="space-y-4">
                        <legend className="font-semibold text-neutral-900 mb-2">🇫🇷 Français (obligatoire)</legend>
                        <input type="text" placeholder="Titre du projet" className={inputClass}
                            value={form.titleFr} onChange={(e) => setForm({ ...form, titleFr: e.target.value })} />
                        <textarea placeholder="Description complète" rows={4} className={inputClass}
                            value={form.descriptionFr} onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })} />
                        <input type="text" placeholder="Résumé court (une phrase)" className={inputClass}
                            value={form.shortDescFr} onChange={(e) => setForm({ ...form, shortDescFr: e.target.value })} />
                        {form.titleFr && (
                            <p className="text-xs text-neutral-400">Adresse : /projects/{slugify(form.titleFr)}</p>
                        )}
                    </fieldset>

                    <details className="group">
                        <summary className="cursor-pointer font-medium text-neutral-700">🇬🇧 English (optionnel)</summary>
                        <div className="space-y-4 mt-4">
                            <input type="text" placeholder="Project title" className={inputClass}
                                value={form.titleEn} onChange={(e) => setForm({ ...form, titleEn: e.target.value })} />
                            <textarea placeholder="Full description" rows={3} className={inputClass}
                                value={form.descriptionEn} onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })} />
                        </div>
                    </details>

                    <details className="group">
                        <summary className="cursor-pointer font-medium text-neutral-700">🇸🇦 العربية (optionnel)</summary>
                        <div className="space-y-4 mt-4" dir="rtl">
                            <input type="text" placeholder="عنوان المشروع" className={inputClass}
                                value={form.titleAr} onChange={(e) => setForm({ ...form, titleAr: e.target.value })} />
                            <textarea placeholder="الوصف الكامل" rows={3} className={inputClass}
                                value={form.descriptionAr} onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })} />
                        </div>
                    </details>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Objectif de collecte (FCFA)
                        </label>
                        <input type="number" min="1" placeholder="5000000" className={inputClass}
                            value={form.goalAmount} onChange={(e) => setForm({ ...form, goalAmount: e.target.value })} />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-2">Image principale</label>
                        {featuredImage ? (
                            <div className="space-y-3">
                                <Image src={featuredImage} alt="Image du projet" width={640} height={360}
                                    className="rounded-xl object-cover w-full h-48" />
                                <button type="button" onClick={() => setFeaturedImage('')}
                                    className="text-sm text-red-600 hover:underline">
                                    Retirer l&apos;image
                                </button>
                            </div>
                        ) : !cloudinaryReady ? (
                            <div className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl text-center text-neutral-400">
                                Upload indisponible : clés Cloudinary à configurer dans le .env
                            </div>
                        ) : (
                            <CldUploadWidget
                                signatureEndpoint="/api/upload/signature"
                                options={{ folder: 'site-next/projects', maxFiles: 1, resourceType: 'image' }}
                                onSuccess={(result) => {
                                    const info = result?.info;
                                    if (info && typeof info === 'object' && 'secure_url' in info) {
                                        setFeaturedImage(info.secure_url as string);
                                    }
                                }}
                            >
                                {({ open }) => (
                                    <button type="button" onClick={() => open()}
                                        className="w-full py-8 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 hover:border-emerald-500 hover:text-emerald-600 transition-colors">
                                        📷 Cliquer pour ajouter une image
                                    </button>
                                )}
                            </CldUploadWidget>
                        )}
                    </div>

                    <div className="flex gap-8">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isUrgent}
                                onChange={(e) => setForm({ ...form, isUrgent: e.target.checked })}
                                className="w-4 h-4 rounded border-neutral-300 text-emerald-600" />
                            <span className="text-neutral-700">🔥 Urgent</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={form.isFeatured}
                                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                className="w-4 h-4 rounded border-neutral-300 text-emerald-600" />
                            <span className="text-neutral-700">⭐ Mis en avant</span>
                        </label>
                    </div>

                    <button type="submit" disabled={saving}
                        className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                        {saving ? 'Publication...' : 'Publier le projet'}
                    </button>
                </form>
            </div>
        </div>
    );
}
