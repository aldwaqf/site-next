'use client';

// Édition d'un projet existant (back-office).

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';

const cloudinaryReady = Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY &&
    process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY !== 'A_REMPLIR',
);

const statusOptions = [
    { value: 'DRAFT', label: 'Brouillon (invisible sur le site)' },
    { value: 'ACTIVE', label: 'Actif' },
    { value: 'COMPLETED', label: 'Terminé' },
    { value: 'SUSPENDED', label: 'Suspendu' },
    { value: 'ARCHIVED', label: 'Archivé' },
];

type TranslationForm = { title: string; description: string; shortDesc: string };
const emptyTranslation: TranslationForm = { title: '', description: '', shortDesc: '' };

export default function EditProjectPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const projectId = params.id as string;
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [status, setStatus] = useState('ACTIVE');
    const [goalAmount, setGoalAmount] = useState('');
    const [isUrgent, setIsUrgent] = useState(false);
    const [isFeatured, setIsFeatured] = useState(false);
    const [featuredImage, setFeaturedImage] = useState('');
    const [trans, setTrans] = useState<Record<'FR' | 'EN' | 'AR', TranslationForm>>({
        FR: { ...emptyTranslation },
        EN: { ...emptyTranslation },
        AR: { ...emptyTranslation },
    });

    useEffect(() => {
        fetch(`/api/projects/${projectId}`)
            .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
            .then((p) => {
                setStatus(p.status);
                setGoalAmount(String(p.goalAmount));
                setIsUrgent(p.isUrgent);
                setIsFeatured(p.isFeatured);
                setFeaturedImage(p.featuredImage || '');
                const next = { FR: { ...emptyTranslation }, EN: { ...emptyTranslation }, AR: { ...emptyTranslation } };
                for (const t of p.translations ?? []) {
                    if (t.language in next) {
                        next[t.language as 'FR' | 'EN' | 'AR'] = {
                            title: t.title ?? '',
                            description: t.description ?? '',
                            shortDesc: t.shortDesc ?? '',
                        };
                    }
                }
                setTrans(next);
            })
            .catch(() => setError('Projet introuvable.'))
            .finally(() => setLoading(false));
    }, [projectId]);

    const updateTrans = (lang: 'FR' | 'EN' | 'AR', field: keyof TranslationForm, value: string) => {
        setTrans((prev) => ({ ...prev, [lang]: { ...prev[lang], [field]: value } }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!trans.FR.title || !trans.FR.description) {
            setError('Le titre et la description en français sont obligatoires.');
            return;
        }
        const goal = Number(goalAmount);
        if (!goal || goal <= 0) {
            setError('Objectif de collecte invalide.');
            return;
        }

        const translations = (['FR', 'EN', 'AR'] as const)
            .filter((lang) => trans[lang].title && trans[lang].description)
            .map((lang) => ({
                language: lang,
                title: trans[lang].title,
                description: trans[lang].description,
                shortDesc: trans[lang].shortDesc || undefined,
            }));

        try {
            setSaving(true);
            const res = await fetch(`/api/projects/${projectId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status,
                    goalAmount: goal,
                    featuredImage: featuredImage || null,
                    isUrgent,
                    isFeatured,
                    translations,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Erreur lors de la sauvegarde');
            setSuccess('Projet mis à jour !');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Supprimer ce projet ? (il sera archivé s\'il a déjà reçu des dons)')) return;
        try {
            const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || 'Suppression impossible');
            router.push(`/${locale}/admin/projects`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Suppression impossible');
        }
    };

    const inputClass = 'w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none';

    if (loading) {
        return <div className="h-64 bg-white rounded-2xl animate-pulse" />;
    }

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-neutral-900 mb-1">Modifier le projet</h1>
            <p className="text-neutral-500 mb-8">{trans.FR.title || projectId}</p>

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
                {error && <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">{error}</div>}
                {success && <div className="bg-emerald-50 text-emerald-700 text-sm p-4 rounded-xl">{success}</div>}

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Statut</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                {(['FR', 'EN', 'AR'] as const).map((lang) => (
                    <details key={lang} open={lang === 'FR'}>
                        <summary className="cursor-pointer font-medium text-neutral-700 mb-2">
                            {lang === 'FR' ? '🇫🇷 Français (obligatoire)' : lang === 'EN' ? '🇬🇧 English' : '🇸🇦 العربية'}
                        </summary>
                        <div className="space-y-4 mt-3" dir={lang === 'AR' ? 'rtl' : 'ltr'}>
                            <input type="text" placeholder="Titre" className={inputClass}
                                value={trans[lang].title} onChange={(e) => updateTrans(lang, 'title', e.target.value)} />
                            <textarea placeholder="Description" rows={4} className={inputClass}
                                value={trans[lang].description} onChange={(e) => updateTrans(lang, 'description', e.target.value)} />
                            <input type="text" placeholder="Résumé court" className={inputClass}
                                value={trans[lang].shortDesc} onChange={(e) => updateTrans(lang, 'shortDesc', e.target.value)} />
                        </div>
                    </details>
                ))}

                <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Objectif de collecte (FCFA)</label>
                    <input type="number" min="1" className={inputClass}
                        value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} />
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
                                    Cliquer pour ajouter une image
                                </button>
                            )}
                        </CldUploadWidget>
                    )}
                </div>

                <div className="flex gap-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isUrgent} onChange={(e) => setIsUrgent(e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-300 text-emerald-600" />
                        <span className="text-neutral-700">Urgent</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)}
                            className="w-4 h-4 rounded border-neutral-300 text-emerald-600" />
                        <span className="text-neutral-700">Mis en avant</span>
                    </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <button type="submit" disabled={saving}
                        className="px-8 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50">
                        {saving ? 'Sauvegarde...' : 'Enregistrer'}
                    </button>
                    <button type="button" onClick={handleDelete}
                        className="text-sm text-red-600 hover:underline">
                        Supprimer le projet
                    </button>
                </div>
            </form>
        </div>
    );
}
