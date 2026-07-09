'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/cart-context';
import { ordersApi } from '@/lib/services';

export default function CheckoutPage() {
    const t = useTranslations();
    const params = useParams();
    const locale = (params.locale as string) || 'fr';
    const { items, total, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        paymentMethod: 'WAVE',
    });

    const shippingCost = 2000;
    const grandTotal = total + shippingCost;
    const currency = t('common.currency');

    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await ordersApi.create({
                customerName: `${formData.firstName} ${formData.lastName}`,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                shippingAddress: `${formData.address}, ${formData.city}`,
                paymentMethod: formData.paymentMethod,
                items: items.map((item) => ({
                    productId: item.id,
                    quantity: item.quantity,
                })),
            });

            // Redirect to PayTech checkout
            if (response.paymentData?.checkoutUrl) {
                clearCart();
                window.location.href = response.paymentData.checkoutUrl;
            } else {
                clearCart();
                setStep(3);
            }
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            setError(msg || t('common.error'));
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0 && step !== 3) {
        return (
            <div className="min-h-screen py-16">
                <div className="container max-w-2xl text-center">
                    <div className="text-6xl mb-6">🛒</div>
                    <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
                        {t('shop.checkout.empty.title')}
                    </h1>
                    <p className="text-neutral-600 mb-8">
                        {t('shop.checkout.empty.description')}
                    </p>
                    <Link
                        href={`/${locale}/shop`}
                        className="inline-flex px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700"
                    >
                        {t('shop.checkout.empty.backToShop')}
                    </Link>
                </div>
            </div>
        );
    }

    // Success step
    if (step === 3) {
        return (
            <div className="min-h-screen py-16">
                <div className="container max-w-2xl text-center">
                    <div className="card p-12">
                        <div className="text-6xl mb-6">✅</div>
                        <h1 className="text-2xl font-bold text-neutral-900 mb-4">
                            {t('shop.checkout.success.title')}
                        </h1>
                        <p className="text-neutral-600 mb-8">
                            {t('shop.checkout.success.description')}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={`/${locale}/shop`}
                                className="px-6 py-3 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700"
                            >
                                {t('shop.checkout.success.continueShopping')}
                            </Link>
                            <Link
                                href={`/${locale}/dashboard`}
                                className="px-6 py-3 border border-neutral-200 text-neutral-700 font-medium rounded-xl hover:bg-neutral-50"
                            >
                                {t('shop.checkout.success.viewOrders')}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-16">
            <div className="container max-w-5xl">
                <h1 className="text-2xl font-bold text-neutral-900 mb-8">{t('shop.checkout.title')}</h1>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    {[1, 2].map((s) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                                step >= s ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500'
                            }`}>
                                {s}
                            </div>
                            <span className={`text-sm ${step >= s ? 'text-neutral-900' : 'text-neutral-500'}`}>
                                {s === 1 ? t('shop.checkout.steps.information') : t('shop.checkout.steps.payment')}
                            </span>
                            {s < 2 && <div className="w-12 h-0.5 bg-neutral-200 mx-2" />}
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                            {step === 1 && (
                                <>
                                    <h2 className="text-lg font-semibold text-neutral-900">{t('shop.checkout.shippingInfoTitle')}</h2>
                                    
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('auth.register.firstName')}</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('auth.register.lastName')}</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('auth.register.email')}</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-neutral-700 mb-2">{t('auth.register.phone')}</label>
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                required
                                                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">{t('shop.checkout.fields.address')}</label>
                                        <input
                                            type="text"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-neutral-700 mb-2">{t('shop.checkout.fields.city')}</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-emerald-500 outline-none"
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
                                    >
                                        {t('shop.checkout.continueToPayment')}
                                    </button>
                                </>
                            )}

                            {step === 2 && (
                                <>
                                    <h2 className="text-lg font-semibold text-neutral-900">{t('shop.checkout.paymentTitle')}</h2>

                                    <div className="space-y-3">
                                        {[
                                            { id: 'WAVE', name: 'Wave', image: '/img/wave.jpg' },
                                            { id: 'ORANGE_MONEY', name: 'Orange Money', image: '/img/orange-money.webp' },
                                            { id: 'FREE_MONEY', name: 'Free Money', image: '/img/free-money.jpg' },
                                            { id: 'VISA', name: 'Carte bancaire', image: '/img/carte-bancaire.webp' },
                                        ].map((method) => (
                                            <label
                                                key={method.id}
                                                className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition-all ${
                                                    formData.paymentMethod === method.id
                                                        ? 'border-emerald-500 bg-emerald-50'
                                                        : 'border-neutral-200 hover:border-neutral-300'
                                                }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={method.id}
                                                    checked={formData.paymentMethod === method.id}
                                                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                                                    className="sr-only"
                                                />
                                                <Image src={method.image} alt={method.name} width={40} height={40} className="rounded-lg object-contain" />
                                                <span className="font-medium text-neutral-900">{method.name}</span>
                                            </label>
                                        ))}
                                    </div>

                                    {error && (
                                        <div className="bg-red-50 text-red-600 text-sm p-4 rounded-xl">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStep(1)}
                                            className="flex-1 py-4 border border-neutral-200 text-neutral-700 font-semibold rounded-xl hover:bg-neutral-50 transition-colors"
                                        >
                                            {t('common.back')}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className="flex-1 py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                        >
                                            {loading
                                                ? t('shop.checkout.processing')
                                                : t('shop.checkout.pay', {
                                                      amount: grandTotal.toLocaleString(),
                                                      currency,
                                                  })}
                                        </button>
                                    </div>
                                </>
                            )}
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="card p-6 h-fit">
                        <h2 className="font-semibold text-neutral-900 mb-4">{t('shop.checkout.summaryTitle')}</h2>

                        <div className="space-y-4 mb-6">
                            {items.map((item) => (
                                <div key={`${item.id}-${item.size}`} className="flex gap-3">
                                    <div className="w-16 h-16 bg-neutral-100 rounded-lg flex items-center justify-center text-xl">
                                        🛍️
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-neutral-900 text-sm">{item.name}</div>
                                        <div className="text-xs text-neutral-500">
                                            {t('shop.product.quantity')}: {item.quantity}
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-neutral-900">
                                        {(item.price * item.quantity).toLocaleString()} {currency}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-neutral-100 pt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">{t('shop.cart.subtotal')}</span>
                                <span className="font-medium">{total.toLocaleString()} {currency}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-600">{t('shop.cart.shipping')}</span>
                                <span className="font-medium">{shippingCost.toLocaleString()} {currency}</span>
                            </div>
                            <div className="border-t border-neutral-100 pt-3 flex justify-between">
                                <span className="font-semibold text-neutral-900">{t('shop.cart.total')}</span>
                                <span className="font-bold text-emerald-600">{grandTotal.toLocaleString()} {currency}</span>
                            </div>
                        </div>

                        <p className="text-xs text-neutral-500 text-center mt-4">
                            💚 {t('shop.cart.footerNote').trim()}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
