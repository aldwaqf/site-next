'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PaymentCancelPage() {
    const t = useTranslations();
    const params = useParams();
    const locale = (params.locale as string) || 'fr';

    return (
        <div className="min-h-screen py-16 flex items-center justify-center">
            <div className="container max-w-lg">
                <div className="card p-10 text-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>

                    <h1 className="text-2xl font-bold text-neutral-900 mb-3">
                        Paiement annul&eacute;
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        Votre paiement a &eacute;t&eacute; annul&eacute;. Vous pouvez r&eacute;essayer &agrave; tout moment.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            href={`/${locale}/donate`}
                            className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition-colors"
                        >
                            R&eacute;essayer
                        </Link>
                        <Link
                            href={`/${locale}`}
                            className="px-6 py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50 transition-colors"
                        >
                            {t('common.backToHome')}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
