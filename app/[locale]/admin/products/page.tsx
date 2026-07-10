'use client';

// Liste des produits de la boutique côté admin.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { productsApi, type ShopProduct } from '@/lib/services';

export default function AdminProductsPage() {
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const [products, setProducts] = useState<ShopProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        productsApi
            .getAll({ limit: 50 })
            .then((res) => setProducts(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const getName = (p: ShopProduct) =>
        p.translations.find((t) => t.language === 'FR')?.name || p.translations[0]?.name || p.slug;

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-neutral-900 mb-1">Produits</h1>
                    <p className="text-neutral-500">{products.length} produit(s) dans la boutique.</p>
                </div>
                <Link href={`/${locale}/admin/products/new`} className="btn-primary px-5 py-3">
                    + Nouveau produit
                </Link>
            </div>

            {loading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-20 bg-white rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm divide-y divide-neutral-100 overflow-hidden">
                    {products.map((product) => (
                        <div key={product.id} className="p-4 flex items-center gap-4 hover:bg-neutral-50 transition-colors">
                            <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0 relative">
                                {product.images[0] && (
                                    <Image src={product.images[0]} alt="" fill className="object-cover" sizes="56px" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-neutral-900 truncate">{getName(product)}</p>
                                <p className="text-sm text-neutral-500">
                                    {product.price.toLocaleString('fr-FR')} FCFA · stock : {product.stock}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {product.stock === 0 && (
                                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">Rupture</span>
                                )}
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${product.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'}`}>
                                    {product.isActive ? 'En vente' : 'Masqué'}
                                </span>
                                <Link href={`/${locale}/admin/products/${product.id}/edit`}
                                    className="ml-2 px-4 py-2 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                                    Modifier
                                </Link>
                            </div>
                        </div>
                    ))}
                    {products.length === 0 && (
                        <div className="p-12 text-center text-neutral-500">Aucun produit pour le moment.</div>
                    )}
                </div>
            )}
        </div>
    );
}
