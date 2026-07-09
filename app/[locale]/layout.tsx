import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import '../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { locales, isRtl, type Locale } from '@/i18n';
import { Header, Footer } from '@/components/layout';
import { CartProvider } from '@/lib/cart-context';
import { AuthProvider } from '@/lib/auth-context';
import { OrganizationJsonLd, WebsiteJsonLd } from '@/components/seo';

const outfit = Outfit({
    subsets: ['latin'],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    metadataBase: new URL('https://waqfald.com'),
    title: {
        default: 'Waqf And Liggeyal Daara - Soutenez l\'éducation coranique au Sénégal',
        template: '%s | Waqf And Liggeyal Daara',
    },
    description:
        "Association caritative dédiée au soutien des daaras (écoles coraniques) au Sénégal. Faites un don pour offrir une éducation de qualité aux enfants.",
    keywords: [
        'waqf', 'daara', 'don', 'charité', 'Sénégal', 'éducation coranique',
        'école coranique', 'sadaqa', 'zakat', 'association islamique',
        'aide humanitaire', 'enfants', 'Thiès', 'Touba', 'Dakar'
    ],
    authors: [{ name: 'Waqf And Liggeyal Daara' }],
    creator: 'Waqf And Liggeyal Daara',
    publisher: 'Waqf And Liggeyal Daara',
    alternates: {
        canonical: 'https://waqfald.com',
        languages: {
            'fr': 'https://waqfald.com/fr',
            'ar': 'https://waqfald.com/ar',
        },
    },
    icons: {
        icon: '/img/VF-LOGO-WAQF-AND-LIGGEYAL-DAARA.png',
        apple: '/img/VF-LOGO-WAQF-AND-LIGGEYAL-DAARA.png',
    },
    openGraph: {
        type: 'website',
        locale: 'fr_SN',
        url: 'https://waqfald.com',
        siteName: 'Waqf And Liggeyal Daara',
        title: 'Waqf And Liggeyal Daara - Soutenez l\'éducation coranique au Sénégal',
        description:
            "Association caritative dédiée au soutien des daaras au Sénégal. Faites un don pour offrir une éducation de qualité aux enfants.",
        images: [
            {
                url: '/img/VF-LOGO-WAQF-AND-LIGGEYAL-DAARA.png',
                width: 1200,
                height: 630,
                alt: 'Waqf And Liggeyal Daara - Association caritative',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Waqf And Liggeyal Daara - Soutenez l\'éducation coranique',
        description:
            "Association caritative dédiée au soutien des daaras au Sénégal.",
        images: ['/img/VF-LOGO-WAQF-AND-LIGGEYAL-DAARA.png'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
    verification: {
        google: 'cubGH4BevwKwrFdJoLpH27-PMFSX9jHlY2QVQOVtewg',
    },
};

export function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    const messages = await getMessages();
    const dir = isRtl(locale as Locale) ? 'rtl' : 'ltr';

    return (
        <html lang={locale} dir={dir} className={outfit.variable}>
            <head>
                <OrganizationJsonLd />
                <WebsiteJsonLd />
            </head>
            <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
                <NextIntlClientProvider messages={messages}>
                    <AuthProvider>
                        <CartProvider>
                            <Header />
                            <main className="flex-1">{children}</main>
                            <Footer />
                        </CartProvider>
                    </AuthProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
