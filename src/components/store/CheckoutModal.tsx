"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Copy, Clock, ShieldCheck, ArrowRight, ExternalLink, Sparkles, AlertCircle, Smartphone } from 'lucide-react';
import type { ProductItem } from '@/data/catalog';
import { calculateProductPrice } from '@/data/catalog';

export interface CheckoutModalProps {
    isOpen: boolean;
    product: ProductItem | null;
    initialVariantKey?: string;
    onClose: () => void;
}

type Step = 'form' | 'code' | 'success';

interface WalletOption {
    id: string;
    name: string;
    codeAbonnement: string;
}

const WALLET_OPTIONS: WalletOption[] = [
    { id: 'bankily', name: 'بنكيلي (Bankily)', codeAbonnement: 'bb91c0b3-f6a4-44be-8dd3-5227201c2dfb' },
    { id: 'masrvi', name: 'مصرفي (Masrvi)', codeAbonnement: 'bb91c0b3-f6a4-44be-8dd3-5227201c2dfb' },
    { id: 'seddad', name: 'سداد (Seddad)', codeAbonnement: 'bb91c0b3-f6a4-44be-8dd3-5227201c2dfb' },
    { id: 'click', name: 'كليك (Click)', codeAbonnement: 'bb91c0b3-f6a4-44be-8dd3-5227201c2dfb' },
];

export default function CheckoutModal({
    isOpen,
    product,
    initialVariantKey,
    onClose,
}: CheckoutModalProps) {
    const [step, setStep] = useState<Step>('form');
    const [selectedDevice, setSelectedDevice] = useState<number>(1);
    const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
    const [selectedWallet, setSelectedWallet] = useState<string>('bankily');

    // Customer form fields
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [errors, setErrors] = useState<{ name?: string; phone?: string; general?: string }>({});

    // Initiation response
    const [isLoading, setIsLoading] = useState(false);
    const [invoiceId, setInvoiceId] = useState<string>('');
    const [paymentCode, setPaymentCode] = useState<string>('');
    const [licenseKey, setLicenseKey] = useState<string>('');
    const [copied, setCopied] = useState(false);
    const [copiedLicense, setCopiedLicense] = useState(false);
    const [timeLeft, setTimeLeft] = useState<number>(15 * 60); // 15 mins

    // Reset when modal opens or closes
    useEffect(() => {
        if (isOpen && product) {
            setStep('form');
            setCustomerName('');
            setCustomerPhone('');
            setCustomerEmail('');
            setErrors({});
            setInvoiceId('');
            setPaymentCode('');
            setLicenseKey('');
            setTimeLeft(15 * 60);

            if (initialVariantKey) {
                if (initialVariantKey.includes('yearly')) setSelectedPeriod('yearly');
                else setSelectedPeriod('monthly');

                if (initialVariantKey.includes('1dev')) setSelectedDevice(1);
                else if (initialVariantKey.includes('2dev')) setSelectedDevice(2);
                else if (initialVariantKey.includes('3dev')) setSelectedDevice(3);
                else if (initialVariantKey.includes('4dev')) setSelectedDevice(4);
            }
        }
    }, [isOpen, product, initialVariantKey]);

    // Timer countdown for code display
    useEffect(() => {
        if (step !== 'code') return;
        const interval = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [step]);

    // Live status polling during code presentation
    useEffect(() => {
        if (step !== 'code' || !invoiceId) return;

        const pollStatus = async () => {
            try {
                const res = await fetch(`/api/checkout/status?invoiceId=${encodeURIComponent(invoiceId)}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.isPaid) {
                        setLicenseKey(data.licenseKey || '');
                        setStep('success');
                    }
                }
            } catch {
                // Defensive: silent retry
            }
        };

        const interval = setInterval(pollStatus, 3000);
        return () => clearInterval(interval);
    }, [step, invoiceId]);

    if (!isOpen || !product) return null;

    // Determine variant key for DIFTAR
    const currentVariantKey = product.variants 
        ? `${selectedPeriod}_${selectedDevice}dev` 
        : undefined;

    const priceInfo = calculateProductPrice(product.id, currentVariantKey);

    const handleCopyCode = () => {
        if (paymentCode) {
            navigator.clipboard.writeText(paymentCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        }
    };

    const handleCopyLicense = () => {
        if (licenseKey) {
            navigator.clipboard.writeText(licenseKey);
            setCopiedLicense(true);
            setTimeout(() => setCopiedLicense(false), 2500);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        let hasError = false;
        const newErrors: { name?: string; phone?: string; general?: string } = {};

        if (!customerName.trim()) {
            newErrors.name = 'يرجى إدخال الاسم الكامل';
            hasError = true;
        }

        const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
        if (cleanPhone.length < 8) {
            newErrors.phone = 'يرجى إدخال رقم هاتف صحيح (8 أرقام على الأقل)';
            hasError = true;
        }

        if (hasError) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            const selectedWalletObj = WALLET_OPTIONS.find((w) => w.id === selectedWallet);
            const res = await fetch('/api/checkout/initiate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    variantKey: currentVariantKey,
                    customerName: customerName.trim(),
                    customerPhone: cleanPhone,
                    customerEmail: customerEmail.trim() || undefined,
                    paymentMethod: selectedWallet,
                    codeAbonnement: selectedWalletObj?.codeAbonnement,
                }),
            });

            const data = await res.json();

            if (!res.ok || !data.success) {
                setErrors({ general: data.error || 'تعذر بدء طلب الدفع، يرجى المحاولة مرة أخرى' });
                setIsLoading(false);
                return;
            }

            if (data.isFree) {
                window.open(data.redirectUrl, '_blank');
                onClose();
                return;
            }

            setInvoiceId(data.invoiceId);
            setPaymentCode(data.paymentCode);
            setStep('code');
        } catch {
            setErrors({ general: 'حدث خطأ في الاتصال بالبوابة، يرجى التحقق من الشبكة' });
        } finally {
            setIsLoading(false);
        }
    };

    const formatTimer = (secs: number) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" dir="rtl">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
                    aria-hidden="true"
                />

                {/* Modal Container */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 20 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 flex flex-col max-h-[92vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/80 p-1 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-brand-red" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">{product.nameAr}</h3>
                                <p className="text-xs text-slate-500 font-medium">{product.nameEn}</p>
                            </div>
                        </div>

                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
                            aria-label="إغلاق"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Scrollable Content Body */}
                    <div className="p-6 overflow-y-auto">
                        {step === 'form' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* DIFTAR Device Variant Selector */}
                                {product.variants && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-700 block">
                                            عدد الأجهزة المتصلة بالنقطة:
                                        </label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {[1, 2, 3, 4].map((dev) => (
                                                <button
                                                    key={dev}
                                                    type="button"
                                                    onClick={() => setSelectedDevice(dev)}
                                                    className={`py-2 px-1 text-center rounded-xl text-xs font-bold transition-all border ${
                                                        selectedDevice === dev
                                                            ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    {dev === 1 ? 'جهاز واحد' : dev === 2 ? 'جهازين' : `${dev} أجهزة`}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Period Selector */}
                                        <div className="grid grid-cols-2 gap-2 pt-2">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPeriod('monthly')}
                                                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                                                    selectedPeriod === 'monthly'
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                شهري (Monthly)
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPeriod('yearly')}
                                                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border relative ${
                                                    selectedPeriod === 'yearly'
                                                        ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                                }`}
                                            >
                                                سنوي (وفّر شهرين)
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Price Box */}
                                <div className="bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-slate-500">{priceInfo.labelAr}</p>
                                        <p className="text-2xl font-black text-slate-900 mt-0.5">
                                            {priceInfo.amount.toLocaleString()}{' '}
                                            <span className="text-sm font-bold text-slate-500">{priceInfo.currency}</span>
                                        </p>
                                    </div>
                                    <div className="text-left text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                        دفع آمن بالرمز
                                    </div>
                                </div>

                                {/* Customer Form Fields */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                            الاسم الكامل <span className="text-brand-red">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="الاسم الكامل للدافع"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 transition-all ${
                                                errors.name 
                                                    ? 'border-red-400 focus:ring-red-200' 
                                                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-100'
                                            }`}
                                        />
                                        {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                            رقم الهاتف المحمول <span className="text-brand-red">*</span>
                                        </label>
                                        <input
                                            type="tel"
                                            dir="ltr"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="رقم الهاتف (مثلاً: 22244112233)"
                                            className={`w-full px-3.5 py-2.5 rounded-xl border text-sm text-right focus:outline-none focus:ring-2 transition-all ${
                                                errors.phone 
                                                    ? 'border-red-400 focus:ring-red-200' 
                                                    : 'border-slate-200 focus:border-slate-900 focus:ring-slate-100'
                                            }`}
                                        />
                                        {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-1.5 block">
                                            البريد الإلكتروني <span className="text-slate-400 font-normal">(اختياري)</span>
                                        </label>
                                        <input
                                            type="email"
                                            dir="ltr"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm text-right focus:border-slate-900 focus:ring-2 focus:ring-slate-100 focus:outline-none transition-all"
                                        />
                                    </div>

                                    {/* Wallet Selection */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-700 mb-2 block">
                                            المحفظة الإلكترونية للدفع:
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {WALLET_OPTIONS.map((w) => (
                                                <button
                                                    key={w.id}
                                                    type="button"
                                                    onClick={() => setSelectedWallet(w.id)}
                                                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-right flex items-center justify-between ${
                                                        selectedWallet === w.id
                                                            ? 'border-emerald-600 bg-emerald-50/60 text-emerald-950 font-bold'
                                                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                                    }`}
                                                >
                                                    <span>{w.name}</span>
                                                    {selectedWallet === w.id && (
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {errors.general && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>{errors.general}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-3.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <span>جاري معالجة الطلب...</span>
                                    ) : (
                                        <>
                                            <span>تأكيد والطلب — استخراج رمز الدفع</span>
                                            <ArrowRight className="w-4 h-4 rotate-180" />
                                        </>
                                    )}
                                </button>
                            </form>
                        )}

                        {step === 'code' && (
                            <div className="space-y-6 text-center">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                                    <Smartphone className="w-3.5 h-3.5" />
                                    <span>كود الدفع في محفظتك</span>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-500 mb-2">أدخل هذا الرمز داخل تطبيق المحفظة الخاص بك:</p>
                                    <div className="bg-slate-50 border-2 border-slate-300 rounded-2xl p-5 flex items-center justify-between gap-3 shadow-inner">
                                        <span className="font-mono text-4xl sm:text-5xl font-black tracking-widest text-slate-900 select-all">
                                            {paymentCode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
                                        >
                                            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                                            <span>{copied ? 'تم النسخ' : 'نسخ'}</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Step-by-Step Instructions */}
                                <div className="bg-[#FAFCFF] border border-slate-200/90 rounded-2xl p-4 text-right space-y-2 text-xs text-slate-700 leading-relaxed font-medium">
                                    <p className="font-bold text-slate-900 mb-2">خطوات الدفع بالهاتف:</p>
                                    <p>1. افتح تطبيق المحفظة (بنكيلي، مصرفي، سداد...).</p>
                                    <p>2. توجه إلى خانة «عمليات الدفع» أو «رمز التاجر».</p>
                                    <p>3. أدخل الرمز الموضح أعلاه واضغط تأكيد.</p>
                                    <p>4. ستتحدث هذه الشاشة تلقائياً فور إتمام الدفع.</p>
                                </div>

                                {/* Pulsing Status & Timer */}
                                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                                    <div className="flex items-center gap-2">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                        </span>
                                        <span className="font-bold text-amber-700">بانتظار تأكيد الدفع من محفظتك...</span>
                                    </div>

                                    <div className="flex items-center gap-1 font-mono font-bold text-slate-600">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>{formatTimer(timeLeft)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'success' && (
                            <div className="space-y-6 text-center py-4">
                                <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                                    <ShieldCheck className="w-8 h-8" />
                                </div>

                                <div>
                                    <h4 className="text-xl font-black text-slate-900">تم استلام دفعتك بنجاح!</h4>
                                    <p className="text-xs text-slate-500 mt-1">
                                        شكراً لثقتكم بشركة AFRIKYIA. تم تفعيل طلبكم بنجاح.
                                    </p>
                                </div>

                                {licenseKey && (
                                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-right">
                                        <label className="text-[11px] font-bold text-slate-500 block mb-1">
                                            رمز الترخيص الخاص بك (License Key):
                                        </label>
                                        <div className="flex items-center justify-between gap-2 mt-1">
                                            <span dir="ltr" className="font-mono text-sm font-extrabold text-slate-900 select-all">
                                                {licenseKey}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleCopyLicense}
                                                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold flex items-center gap-1 transition-all"
                                            >
                                                {copiedLicense ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                                <span>{copiedLicense ? 'تم النسخ' : 'نسخ'}</span>
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="pt-2">
                                    <a
                                        href={product.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                                    >
                                        <span>فتح التطبيق واستخدام الترخيص</span>
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
