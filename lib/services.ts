// ⚠️ VERSION MOCKÉE (Étape 3 du refactor)
// Même interface que le services.ts original, mais les données sont locales.
// À l'Étape 4, on remplacera l'intérieur de ces fonctions par de vrais
// appels aux API routes Next.js, sans toucher aux pages qui les utilisent.

// Types (repris tels quels du projet original)
export interface Project {
    id: string;
    slug: string;
    status: string;
    goalAmount: number;
    collectedAmount: number;
    donorCount: number;
    featuredImage?: string;
    isUrgent: boolean;
    isFeatured: boolean;
    translations: ProjectTranslation[];
}

export interface ProjectTranslation {
    language: string;
    title: string;
    description: string;
    shortDesc?: string;
}

export interface Campaign {
    id: string;
    slug: string;
    status: string;
    goalAmount: number;
    collectedAmount: number;
    startDate: string;
    endDate: string;
    isUrgent: boolean;
    translations: CampaignTranslation[];
}

export interface CampaignTranslation {
    language: string;
    title: string;
    description: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}

// ---------------------------------------------------------------------------
// Données mockées
// ---------------------------------------------------------------------------

const mockProjects: Project[] = [
    {
        id: 'proj_1',
        slug: 'renovation-daara-thies',
        status: 'ACTIVE',
        goalAmount: 15000000,
        collectedAmount: 9750000,
        donorCount: 214,
        featuredImage: '/img/imgi_3_Image_fx103.jpg',
        isUrgent: true,
        isFeatured: true,
        translations: [
            { language: 'FR', title: 'Rénovation du daara de Thiès', description: 'Réhabilitation complète des salles de classe et du dortoir du daara de Thiès pour accueillir 150 talibés dans de bonnes conditions.', shortDesc: 'Réhabiliter les salles et le dortoir pour 150 talibés.' },
            { language: 'EN', title: 'Thiès Daara Renovation', description: 'Complete rehabilitation of the classrooms and dormitory of the Thiès daara to host 150 students in good conditions.', shortDesc: 'Rehabilitate classrooms and dormitory for 150 students.' },
            { language: 'AR', title: 'ترميم دار تيس', description: 'إعادة تأهيل كاملة للفصول الدراسية والمهجع في دار تيس لاستقبال 150 طالبًا في ظروف جيدة.', shortDesc: 'إعادة تأهيل الفصول والمهجع لـ150 طالبًا.' },
        ],
    },
    {
        id: 'proj_2',
        slug: 'puits-eau-potable-touba',
        status: 'ACTIVE',
        goalAmount: 8000000,
        collectedAmount: 3200000,
        donorCount: 87,
        featuredImage: '/img/imgi_50_Image_fx90.jpg',
        isUrgent: false,
        isFeatured: true,
        translations: [
            { language: 'FR', title: 'Puits d\'eau potable à Touba', description: 'Forage d\'un puits et installation d\'un système de distribution d\'eau potable pour le daara et le village voisin.', shortDesc: 'Un puits pour le daara et le village.' },
            { language: 'EN', title: 'Drinking Water Well in Touba', description: 'Drilling a well and installing a drinking water distribution system for the daara and the neighbouring village.', shortDesc: 'A well for the daara and the village.' },
            { language: 'AR', title: 'بئر مياه صالحة للشرب في طوبى', description: 'حفر بئر وتركيب نظام توزيع مياه صالحة للشرب للدار والقرية المجاورة.', shortDesc: 'بئر للدار والقرية.' },
        ],
    },
    {
        id: 'proj_3',
        slug: 'cantine-scolaire-dakar',
        status: 'ACTIVE',
        goalAmount: 5000000,
        collectedAmount: 4650000,
        donorCount: 156,
        featuredImage: '/img/imgi_51_Image_fx85.jpg',
        isUrgent: false,
        isFeatured: false,
        translations: [
            { language: 'FR', title: 'Cantine scolaire à Dakar', description: 'Mise en place d\'une cantine pour offrir deux repas par jour aux 200 talibés du daara de Dakar.', shortDesc: 'Deux repas par jour pour 200 talibés.' },
            { language: 'EN', title: 'School Canteen in Dakar', description: 'Setting up a canteen to provide two meals a day to the 200 students of the Dakar daara.', shortDesc: 'Two meals a day for 200 students.' },
            { language: 'AR', title: 'مطعم مدرسي في داكار', description: 'إنشاء مطعم لتقديم وجبتين يوميًا لـ200 طالب في دار داكار.', shortDesc: 'وجبتان يوميًا لـ200 طالب.' },
        ],
    },
];

const mockCampaigns: Campaign[] = [
    {
        id: 'camp_1',
        slug: 'ramadan-2026',
        status: 'ACTIVE',
        goalAmount: 20000000,
        collectedAmount: 12400000,
        startDate: '2026-02-18T00:00:00.000Z',
        endDate: '2026-03-20T00:00:00.000Z',
        isUrgent: true,
        translations: [
            { language: 'FR', title: 'Campagne Ramadan 2026', description: 'Paniers alimentaires et repas de rupture du jeûne pour les daaras pendant le mois béni.' },
            { language: 'EN', title: 'Ramadan 2026 Campaign', description: 'Food baskets and iftar meals for the daaras during the blessed month.' },
            { language: 'AR', title: 'حملة رمضان 2026', description: 'سلال غذائية ووجبات إفطار للدور خلال الشهر المبارك.' },
        ],
    },
    {
        id: 'camp_2',
        slug: 'tabaski-solidaire',
        status: 'ACTIVE',
        goalAmount: 10000000,
        collectedAmount: 3800000,
        startDate: '2026-05-01T00:00:00.000Z',
        endDate: '2026-06-30T00:00:00.000Z',
        isUrgent: false,
        translations: [
            { language: 'FR', title: 'Tabaski solidaire', description: 'Offrir des moutons et des habits neufs aux familles des talibés pour la fête de Tabaski.' },
            { language: 'EN', title: 'Solidarity Tabaski', description: 'Providing sheep and new clothes to students\' families for the Tabaski celebration.' },
            { language: 'AR', title: 'تباسكي التضامن', description: 'توفير الأضاحي والملابس الجديدة لأسر الطلاب بمناسبة عيد الأضحى.' },
        ],
    },
];

const mockProducts = [
    {
        id: 'prod_1',
        slug: 'tshirt-waqf',
        price: 8000,
        images: ['/img/faire-un-waqf.webp'],
        translations: [
            { language: 'FR', name: 'T-shirt Waqf', description: 'T-shirt solidaire, les bénéfices financent les daaras.' },
            { language: 'EN', name: 'Waqf T-shirt', description: 'Solidarity t-shirt, profits fund the daaras.' },
            { language: 'AR', name: 'قميص الوقف', description: 'قميص تضامني، الأرباح تمول الدور.' },
        ],
    },
    {
        id: 'prod_2',
        slug: 'tote-bag-daara',
        price: 5000,
        images: ['/img/devenir-benevole.webp'],
        translations: [
            { language: 'FR', name: 'Tote bag Daara', description: 'Sac en toile aux couleurs de l\'association.' },
            { language: 'EN', name: 'Daara Tote Bag', description: 'Canvas bag in the association\'s colours.' },
            { language: 'AR', name: 'حقيبة الدار', description: 'حقيبة قماشية بألوان الجمعية.' },
        ],
    },
];

const mockArticles = [
    {
        id: 'cont_1',
        slug: 'rentree-coranique-2026',
        type: 'ARTICLE',
        featuredImage: '/img/imgi_49_ab-bg-page-title.jpg',
        isPublished: true,
        createdAt: '2026-06-15T00:00:00.000Z',
        publishedAt: '2026-06-15T00:00:00.000Z',
        translations: [
            { language: 'FR', title: 'Rentrée coranique 2026 : 300 talibés équipés', excerpt: 'Grâce à vos dons, chaque talibé a reçu un kit complet pour bien démarrer l\'année.', body: 'Grâce à vos dons, chaque talibé a reçu un kit complet.' },
            { language: 'EN', title: '2026 Quranic School Year: 300 Students Equipped', excerpt: 'Thanks to your donations, every student received a complete kit to start the year.', body: 'Thanks to your donations, every student received a complete kit.' },
            { language: 'AR', title: 'الدخول القرآني 2026: تجهيز 300 طالب', excerpt: 'بفضل تبرعاتكم، حصل كل طالب على مجموعة كاملة لبدء العام.', body: 'بفضل تبرعاتكم، حصل كل طالب على مجموعة كاملة.' },
        ],
    },
    {
        id: 'cont_2',
        slug: 'inauguration-puits-mbacke',
        type: 'ARTICLE',
        featuredImage: '/img/imgi_3_Image_fx93.jpg',
        isPublished: true,
        createdAt: '2026-05-20T00:00:00.000Z',
        publishedAt: '2026-05-20T00:00:00.000Z',
        translations: [
            { language: 'FR', title: 'Inauguration du puits de Mbacké', excerpt: 'Le premier puits financé par la communauté est en service depuis mai.', body: 'Le premier puits financé par la communauté est en service.' },
            { language: 'EN', title: 'Mbacké Well Inauguration', excerpt: 'The first community-funded well has been in service since May.', body: 'The first community-funded well is in service.' },
            { language: 'AR', title: 'تدشين بئر مباكي', excerpt: 'أول بئر ممول من المجتمع يعمل منذ مايو.', body: 'أول بئر ممول من المجتمع يعمل الآن.' },
        ],
    },
];

const mockStats = {
    totalAmount: 34550000,
    totalDonations: 34550000,
    totalDonors: 457,
    totalProjects: mockProjects.length,
    totalCampaigns: mockCampaigns.length,
};

// Simule la petite latence d'un vrai appel réseau
const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

function paginate<T>(items: T[], params?: { page?: number; limit?: number }): PaginatedResponse<T> {
    const page = params?.page ?? 1;
    const limit = params?.limit ?? 10;
    const start = (page - 1) * limit;
    return {
        data: items.slice(start, start + limit),
        meta: {
            total: items.length,
            page,
            limit,
            totalPages: Math.ceil(items.length / limit),
        },
    };
}

// ---------------------------------------------------------------------------
// APIs mockées (mêmes signatures que l'original)
// ---------------------------------------------------------------------------

export const projectsApi = {
    getAll: async (params?: { lang?: string; page?: number; limit?: number; isUrgent?: boolean }) => {
        await delay();
        const filtered = params?.isUrgent !== undefined
            ? mockProjects.filter((p) => p.isUrgent === params.isUrgent)
            : mockProjects;
        return paginate(filtered, params);
    },

    getBySlug: async (slug: string) => {
        await delay();
        const project = mockProjects.find((p) => p.slug === slug);
        if (!project) throw new Error(`Project not found: ${slug}`);
        return project;
    },

    getById: async (id: string) => {
        await delay();
        const project = mockProjects.find((p) => p.id === id);
        if (!project) throw new Error(`Project not found: ${id}`);
        return project;
    },

    getStats: async () => {
        await delay();
        return mockStats;
    },
};

export const campaignsApi = {
    getAll: async (params?: { lang?: string; page?: number; limit?: number }) => {
        await delay();
        return paginate(mockCampaigns, params);
    },

    getActive: async () => {
        await delay();
        return mockCampaigns.filter((c) => c.status === 'ACTIVE');
    },

    getBySlug: async (slug: string) => {
        await delay();
        const campaign = mockCampaigns.find((c) => c.slug === slug);
        if (!campaign) throw new Error(`Campaign not found: ${slug}`);
        return campaign;
    },
};

export const donationsApi = {
    create: async (donation: {
        amount: number;
        paymentMethod: string;
        projectId?: string;
        campaignId?: string;
        donorName?: string;
        donorEmail?: string;
        donorPhone?: string;
        isAnonymous?: boolean;
        message?: string;
    }) => {
        await delay();
        return { id: 'don_mock', status: 'PENDING', ...donation };
    },

    confirm: async (donationId: string, reference: string, provider: string) => {
        await delay();
        return { id: donationId, status: 'COMPLETED', reference, provider };
    },

    getStats: async () => {
        await delay();
        return mockStats;
    },

    getRecent: async (params?: { page?: number; limit?: number }) => {
        await delay();
        return paginate([], params);
    },
};

export const contentsApi = {
    getAll: async (params?: { type?: string; lang?: string; isPublished?: boolean; page?: number; limit?: number }) => {
        await delay();
        const filtered = params?.type
            ? mockArticles.filter((a) => a.type === params.type)
            : mockArticles;
        return paginate(filtered, params);
    },

    getBySlug: async (slug: string) => {
        await delay();
        const content = mockArticles.find((a) => a.slug === slug);
        if (!content) throw new Error(`Content not found: ${slug}`);
        return content;
    },

    getArticles: async (_lang?: string, limit?: number) => {
        await delay();
        return mockArticles.slice(0, limit ?? mockArticles.length);
    },

    getEvents: async () => {
        await delay();
        return [];
    },
};

export const productsApi = {
    getAll: async (params?: { search?: string; categoryId?: string; lang?: string; isActive?: boolean; page?: number; limit?: number }) => {
        await delay();
        return paginate(mockProducts, params);
    },

    getBySlug: async (slug: string) => {
        await delay();
        const product = mockProducts.find((p) => p.slug === slug);
        if (!product) throw new Error(`Product not found: ${slug}`);
        return product;
    },

    getCategories: async () => {
        await delay();
        return [];
    },
};

export const contactsApi = {
    submit: async (contactData: {
        name: string;
        email: string;
        phone?: string;
        subject?: string;
        message: string;
    }) => {
        await delay(400);
        console.info('[mock] Message de contact reçu :', contactData);
        return { success: true };
    },

    subscribeNewsletter: async (email: string) => {
        await delay(400);
        console.info('[mock] Inscription newsletter :', email);
        return { success: true };
    },

    unsubscribeNewsletter: async (email: string) => {
        await delay(400);
        console.info('[mock] Désinscription newsletter :', email);
        return { success: true };
    },
};
