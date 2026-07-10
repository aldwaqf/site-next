'use client';

// Liste des projets côté admin, avec accès à l'édition.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { projectsApi, Project } from '@/lib/services';

const statusLabels: Record<string, { label: string; className: string }> = {
    DRAFT: { label: 'Brouillon', className: 'bg-neutral-100 text-neutral-600' },
    ACTIVE: { label: 'Actif', className: 'bg-emerald-100 text-emerald-700' },
    COMPLETED: { label: 'Terminé', className: 'bg-blue-100 text-blue-700' },
    SUSPENDED: { label: 'Suspendu', className: 'bg-amber-100 text-amber-700' },
    ARCHIVED: { label: 'Archivé', className: 'bg-neutral-200 text-neutral-500' },
};

export default function AdminProjectsPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        projectsApi
            .getAll({ limit: 50 })
            .then((res) => setProjects(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getTitle = (p: Project) =>
        p.translations?.find((t) => t.language === 'FR')?.title || p.translations?.[0]?.title || p.slug;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-1">Projets</h1>
                    <p className="text-neutral-500">{projects.length} projet(s) sur le site.</p>
                </div>
                <Link href={`/${locale}/admin/projects/new`} className="btn-primary px-5 py-3">
                    + Nouveau projet
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
                    {projects.map((project) => {
                        const progress = project.goalAmount
                            ? Math.min(Math.round((project.collectedAmount / project.goalAmount) * 100), 100)
                            : 0;
                        const status = statusLabels[project.status] ?? statusLabels.DRAFT;
                        return (
                            <div key={project.id} className="p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                                <div className="w-16 h-12 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 relative">
                                    {project.featuredImage && (
                                        <Image src={project.featuredImage} alt="" fill className="object-cover" sizes="64px" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-neutral-900 truncate">{getTitle(project)}</p>
                                    <p className="text-sm text-neutral-500">
                                        {project.collectedAmount.toLocaleString('fr-FR')} / {project.goalAmount.toLocaleString('fr-FR')} FCFA · {progress}% · {project.donorCount} donateur(s)
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {project.isUrgent && (
                                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Urgent</span>
                                    )}
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${status.className}`}>
                                        {status.label}
                                    </span>
                                    <Link
                                        href={`/${locale}/admin/projects/${project.id}/edit`}
                                        className="ml-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                                    >
                                        Modifier
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                    {projects.length === 0 && (
                        <div className="p-12 text-center text-neutral-500">Aucun projet pour le moment.</div>
                    )}
                </div>
            )}
        </div>
    );
}
