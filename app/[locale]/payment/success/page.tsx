'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function PaymentSuccessPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const { isAuthenticated: isLoggedIn } = useAuth();

    return (
        <div className="min-h-screen py-16 flex items-center justify-center">
            <div className="container max-w-lg">
                <div className="card p-10 text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-neutral-900 mb-3">
                        Jazak Allahu Khayran !
                    </h1>
                    <p className="text-neutral-600 mb-2">
                        Votre paiement a été traité avec succès.
                    </p>
                    <p className="text-neutral-600 mb-8">
                        Qu&apos;Allah accepte votre contribution et vous récompense abondamment.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={`/${locale}`}
                            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            Retour à l&apos;accueil
                        </Link>
                        {isLoggedIn ? (
                            <Link
                                href={`/${locale}/dashboard`}
                                className="px-6 py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors"
                            >
                                Mon tableau de bord
                            </Link>
                        ) : (
                            <Link
                                href={`/${locale}/donate`}
                                className="px-6 py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors"
                            >
                                Faire un autre don
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
