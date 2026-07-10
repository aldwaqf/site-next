'use client';

// Layout commun du back-office : menu latéral + garde d'accès admin.
// Toutes les pages sous /admin héritent automatiquement des deux.

import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { LayoutDashboard, FolderKanban, PlusCircle, HeartHandshake, ShoppingBag, ExternalLink } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const navItems = [
    { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
    { href: '/admin/projects', label: 'Projets', icon: FolderKanban, exact: true },
    { href: '/admin/projects/new', label: 'Nouveau projet', icon: PlusCircle, exact: true },
    { href: '/admin/donations', label: 'Dons', icon: HeartHandshake, exact: true },
    { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag, exact: true },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const pathname = usePathname();
    const { user, isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
        );
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

    return (
        <div className="min-h-screen bg-neutral-100 flex">
            {/* Sidebar */}
            <aside className="w-60 flex-shrink-0 bg-slate-900 text-slate-300 hidden md:flex flex-col">
                <div className="px-5 py-6 border-b border-slate-800">
                    <p className="text-white font-bold">Administration</p>
                    <p className="text-xs text-slate-400">Waqf And Liggeyal Daara</p>
                </div>
                <nav className="flex-1 py-4 space-y-1 px-3">
                    {navItems.map((item) => {
                        const href = `/${locale}${item.href}`;
                        const active = item.exact
                            ? pathname === href || pathname === item.href
                            : pathname.startsWith(href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={href}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                                    active
                                        ? 'bg-emerald-600 text-white'
                                        : 'hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" aria-hidden="true" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3 border-t border-slate-800">
                    <Link
                        href={`/${locale}`}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-slate-800 hover:text-white transition-colors"
                    >
                        <ExternalLink className="w-4 h-4" aria-hidden="true" />
                        Voir le site
                    </Link>
                </div>
            </aside>

            {/* Contenu + barre mobile */}
            <div className="flex-1 min-w-0">
                <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex gap-4 overflow-x-auto text-sm">
                    {navItems.map((item) => (
                        <Link key={item.href} href={`/${locale}${item.href}`} className="whitespace-nowrap">
                            {item.label}
                        </Link>
                    ))}
                </div>
                <main className="p-6 lg:p-10">{children}</main>
            </div>
        </div>
    );
}
