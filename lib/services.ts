// Couche d'accès aux données.
// - projectsApi : branché sur les vraies API routes (/api/projects) ✅
// - le reste : encore mocké, sera branché au fur et à mesure des étapes.

async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`API ${url} → ${res.status}`);
    }
    return res.json();
}

function buildQuery(params?: Record<string, string | number | boolean | undefined>) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
        if (value !== undefined) search.set(key, String(value));
    }
    const qs = search.toString();
    return qs ? `?${qs}` : '';
}

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
// ---------------------------------------------------------------------------








// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------

export const projectsApi = {
    getAll: async (params?: { lang?: string; page?: number; limit?: number; isUrgent?: boolean }) => {
        return fetchJson<PaginatedResponse<Project>>(`/api/projects${buildQuery(params)}`);
    },

    getBySlug: async (slug: string, lang?: string) => {
        return fetchJson<Project>(`/api/projects/slug/${slug}${buildQuery({ lang })}`);
    },

    getById: async (id: string, lang?: string) => {
        return fetchJson<Project>(`/api/projects/${id}${buildQuery({ lang })}`);
    },

    getStats: async () => {
        return fetchJson<{ total: number; active: number; urgent: number; totalCollected: number }>(
            '/api/projects/stats',
        );
    },
};

export const campaignsApi = {
    getAll: async (params?: { lang?: string; page?: number; limit?: number }) => {
        return fetchJson<PaginatedResponse<Campaign>>(`/api/campaigns${buildQuery(params)}`);
    },

    getActive: async () => {
        return fetchJson<Campaign[]>('/api/campaigns/active');
    },

    getBySlug: async (slug: string, lang?: string) => {
        return fetchJson<Campaign>(`/api/campaigns/slug/${slug}${buildQuery({ lang })}`);
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
        const res = await fetch('/api/donations', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(donation),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            throw new Error(data?.error || `API /api/donations → ${res.status}`);
        }
        return data as {
            donation: { id: string; amount: number };
            paymentData: { checkoutUrl?: string; token?: string; reference: string; success: boolean };
        };
    },

    getStats: async () => {
        return fetchJson<{
            totalDonations: number;
            totalAmount: number;
            totalDonors: number;
            totalProjects: number;
            totalCampaigns: number;
        }>('/api/donations/stats');
    },

    getRecent: async (params?: { page?: number; limit?: number }) => {
        return fetchJson<PaginatedResponse<unknown>>(`/api/donations${buildQuery(params)}`);
    },

    getMyDonations: async () => {
        return fetchJson<Array<{
            id: string;
            amount: number;
            currency: string;
            type: string;
            message?: string;
            createdAt: string;
            project?: { slug: string; translations?: { language: string; title: string }[] } | null;
            campaign?: { slug: string } | null;
            transaction?: { status: string; paymentMethod: string; paidAt?: string } | null;
        }>>('/api/donations/me');
    },
};

export interface ContentItem {
    id: string;
    slug: string;
    type: string;
    featuredImage?: string;
    isPublished: boolean;
    publishedAt?: string;
    createdAt: string;
    translations: Array<{ language: string; title: string; body: string; excerpt?: string }>;
}

export const contentsApi = {
    getAll: async (params?: { type?: string; lang?: string; isPublished?: boolean; page?: number; limit?: number }) => {
        return fetchJson<PaginatedResponse<ContentItem>>(
            `/api/contents${buildQuery({ type: params?.type, lang: params?.lang, page: params?.page, limit: params?.limit })}`,
        );
    },

    getBySlug: async (slug: string, lang?: string) => {
        return fetchJson<ContentItem>(`/api/contents/slug/${encodeURIComponent(slug)}${buildQuery({ lang })}`);
    },

    getArticles: async (lang?: string, limit?: number) => {
        const res = await fetchJson<PaginatedResponse<ContentItem>>(
            `/api/contents${buildQuery({ type: 'ARTICLE', lang, limit })}`,
        );
        return res.data;
    },

    getEvents: async (lang?: string) => {
        const res = await fetchJson<PaginatedResponse<ContentItem>>(
            `/api/contents${buildQuery({ type: 'EVENT', lang })}`,
        );
        return res.data;
    },
};

export interface ShopProduct {
    id: string;
    slug: string;
    price: number;
    comparePrice?: number;
    stock: number;
    images: string[];
    isActive: boolean;
    isFeatured?: boolean;
    translations: Array<{ language: string; name: string; description?: string }>;
    categories?: Array<{ category: { id: string; translations: { language: string; name: string }[] } }>;
}

export const productsApi = {
    getAll: async (params?: { search?: string; categoryId?: string; lang?: string; isActive?: boolean; page?: number; limit?: number }) => {
        return fetchJson<PaginatedResponse<ShopProduct>>(`/api/products${buildQuery({ lang: params?.lang, page: params?.page, limit: params?.limit })}`);
    },

    getBySlug: async (slug: string, lang?: string) => {
        return fetchJson<ShopProduct>(`/api/products/slug/${slug}${buildQuery({ lang })}`);
    },

    getCategories: async (lang?: string) => {
        return fetchJson<Array<{ id: string; translations: Array<{ language: string; name: string }> }>>(
            `/api/products/categories${buildQuery({ lang })}`,
        );
    },
};

export const ordersApi = {
    create: async (orderData: {
        customerName: string;
        customerEmail: string;
        customerPhone?: string;
        shippingAddress?: string;
        paymentMethod?: string;
        items: { productId: string; quantity: number }[];
    }) => {
        const res = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
            throw new Error(data?.error || `API /api/orders → ${res.status}`);
        }
        return data as {
            order: { id: string; orderNumber: string; total: number };
            paymentData: { checkoutUrl?: string; token?: string; reference: string; success: boolean };
        };
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
        await new Promise((resolve) => setTimeout(resolve, 400));
        console.info('[mock] Message de contact reçu :', contactData);
        return { success: true };
    },

    subscribeNewsletter: async (email: string) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        console.info('[mock] Inscription newsletter :', email);
        return { success: true };
    },

    unsubscribeNewsletter: async (email: string) => {
        await new Promise((resolve) => setTimeout(resolve, 400));
        console.info('[mock] Désinscription newsletter :', email);
        return { success: true };
    },
};
