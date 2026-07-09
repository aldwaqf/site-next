'use client';

export function OrganizationJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NGO',
        name: 'Waqf And Liggeyal Daara',
        alternateName: 'WALD',
        url: 'https://waqfald.com',
        logo: 'https://waqfald.com/img/VF-LOGO-WAQF-AND-LIGGEYAL-DAARA.png',
        description: 'Association caritative dédiée au soutien des daaras (écoles coraniques) au Sénégal.',
        foundingDate: '2020',
        address: {
            '@type': 'PostalAddress',
            addressCountry: 'SN',
            addressRegion: 'Dakar',
        },
        areaServed: {
            '@type': 'Country',
            name: 'Sénégal',
        },
        sameAs: [
            'https://facebook.com/waqfald',
            'https://instagram.com/waqfald',
        ],
        nonprofitStatus: 'Nonprofit501c3',
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function DonateActionJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'DonateAction',
        name: 'Faire un don à Waqf And Liggeyal Daara',
        description: 'Soutenez l\'éducation coranique au Sénégal',
        recipient: {
            '@type': 'NGO',
            name: 'Waqf And Liggeyal Daara',
            url: 'https://waqfald.com',
        },
        target: {
            '@type': 'EntryPoint',
            urlTemplate: 'https://waqfald.com/fr/donate',
            actionPlatform: [
                'http://schema.org/DesktopWebPlatform',
                'http://schema.org/MobileWebPlatform',
            ],
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

interface ProjectJsonLdProps {
    name: string;
    description: string;
    image: string;
    url: string;
    goalAmount: number;
    collectedAmount: number;
}

export function ProjectJsonLd({ name, description, image, url, goalAmount }: Omit<ProjectJsonLdProps, 'collectedAmount'>) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Project',
        name,
        description,
        image,
        url,
        funding: {
            '@type': 'MonetaryGrant',
            amount: {
                '@type': 'MonetaryAmount',
                value: goalAmount,
                currency: 'XOF',
            },
        },
        funder: {
            '@type': 'NGO',
            name: 'Waqf And Liggeyal Daara',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}

export function WebsiteJsonLd() {
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Waqf And Liggeyal Daara',
        url: 'https://waqfald.com',
        potentialAction: {
            '@type': 'SearchAction',
            target: {
                '@type': 'EntryPoint',
                urlTemplate: 'https://waqfald.com/fr/projects?search={search_term_string}',
            },
            'query-input': 'required name=search_term_string',
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
    );
}
