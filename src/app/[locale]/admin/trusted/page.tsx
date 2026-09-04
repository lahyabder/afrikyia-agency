"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Save, AlertTriangle, CheckCircle2, RotateCcw, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import arMessages from '../../../../../messages/ar.json';
import frMessages from '../../../../../messages/fr.json';
import enMessages from '../../../../../messages/en.json';
import achievements from '@/data/achievements.json';

type TrustedContent = {
    tag: string;
    title: string;
};

type Partner = {
    id: string;
    name: string;
    logoUrl: string;
};

type TrustedTranslations = {
    ar: TrustedContent;
    fr: TrustedContent;
    en: TrustedContent;
    partners: Partner[];
};

const defaultClients: Partner[] = Array.from(new Set(achievements.map(a => a.client))).filter(Boolean).map((name, i) => ({
    id: String(i),
    name: name as string,
    logoUrl: ""
}));

export default function AdminTrustedPage() {
    const { t, isRTL } = useLanguage();
    
    // Data State
    const [content, setContent] = useState<TrustedTranslations>({
        ar: arMessages.trusted,
        fr: frMessages.trusted,
        en: enMessages.trusted,
        partners: defaultClients
    });
    
    const [formLanguageTab, setFormLanguageTab] = useState<'ar' | 'fr' | 'en'>('ar');
    const [notification, setNotification] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const cached = localStorage.getItem('afrikyia-trusted');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setContent({
                    ar: parsed.ar || arMessages.trusted,
                    fr: parsed.fr || frMessages.trusted,
                    en: parsed.en || enMessages.trusted,
                    partners: parsed.partners && Array.isArray(parsed.partners) ? parsed.partners : defaultClients
                });
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const showNotification = (type: 'success' | 'warn' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem('afrikyia-trusted', JSON.stringify(content));
        window.dispatchEvent(new Event('afrikyia-trusted-updated'));
        showNotification('success', 'تم حفظ التعديلات بنجاح | Saved successfully');
    };

    const handleReset = () => {
        if (!confirm('هل أنت متأكد من استعادة النصوص الأصلية وإلغاء كافة التعديلات؟\nAre you sure you want to reset to default texts?')) return;
        const original = {
            ar: arMessages.trusted,
            fr: frMessages.trusted,
            en: enMessages.trusted,
            partners: defaultClients
        };
        setContent(original);
        localStorage.removeItem('afrikyia-trusted');
        window.dispatchEvent(new Event('afrikyia-trusted-updated'));
        showNotification('success', 'تمت استعادة النصوص الأصلية بنجاح | Reset to default successfully');
    };

    const handleContentChange = (field: keyof TrustedContent, value: string) => {
        setContent(prev => ({
            ...prev,
            [formLanguageTab]: {
                ...prev[formLanguageTab],
                [field]: value
            }
        }));
    };

    const addPartner = () => {
        setContent(prev => ({
            ...prev,
            partners: [...prev.partners, { id: Date.now().toString(), name: '', logoUrl: '' }]
        }));
    };

    const updatePartner = (id: string, field: keyof Partner, value: string) => {
        setContent(prev => ({
            ...prev,
            partners: prev.partners.map(p => p.id === id ? { ...p, [field]: value } : p)
        }));
    };

    const removePartner = (id: string) => {
        setContent(prev => ({
            ...prev,
            partners: prev.partners.filter(p => p.id !== id)
        }));
    };

    if (!isMounted) return <div className="min-h-screen bg-[#080808]"></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
            {/* Header Row */}
            <div className={`flex flex-col md:flex-row justify-between items-center bg-black/40 border border-white/5 p-6 rounded-2xl gap-6 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold">{t.admin.menu.trusted || 'شركاء النجاح'}</h1>
                        <p className="text-xs text-white/70">تعديل نصوص قسم عملاؤنا وشركاؤنا وإضافة الشعارات</p>
                    </div>
                </div>
            </div>

            {/* Notification Toast */}
            {notification && (
                <div className={`p-4 rounded-xl border flex items-center gap-3 animate-fade-in-down ${
                    notification.type === 'success' 
                        ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                        : notification.type === 'warn'
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                            : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                    {notification.type === 'success' ? (
                        <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    ) : (
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    )}
                    <p className="text-sm font-medium">{notification.message}</p>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-8">
                {/* Form - Text content */}
                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10 bg-black/50">
                        <h2 className="text-lg font-bold text-white">تعديل النصوص</h2>
                        <p className="text-xs text-white/60 mt-1">يجب إدخال النصوص باللغات الثلاث لضمان ظهورها بشكل صحيح</p>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Language Tabs */}
                        <div>
                            <div className="flex rounded-xl overflow-hidden bg-black/40 border border-white/10 p-1">
                                {(['ar', 'fr', 'en'] as const).map((lang) => (
                                    <button
                                        key={lang}
                                        type="button"
                                        onClick={() => setFormLanguageTab(lang)}
                                        className={`flex-1 py-3 text-xs font-bold transition-all ${
                                            formLanguageTab === lang
                                                ? 'bg-brand-red text-white shadow-lg'
                                                : 'text-white/50 hover:bg-white/5 hover:text-white'
                                        }`}
                                    >
                                        {lang === 'ar' ? 'العربية' : lang === 'fr' ? 'Français' : 'English'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Tag */}
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">العلامة العلوية (TAG)</label>
                                    <input
                                        type="text"
                                        value={content[formLanguageTab].tag}
                                        onChange={(e) => handleContentChange('tag', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                        required
                                    />
                                </div>

                                {/* Title */}
                                <div>
                                    <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">العنوان الرئيسي (TITLE)</label>
                                    <input
                                        type="text"
                                        value={content[formLanguageTab].title}
                                        onChange={(e) => handleContentChange('title', e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form - Partners logos */}
                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-white/10 bg-black/50 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-bold text-white">قائمة الشركاء والعملاء</h2>
                            <p className="text-xs text-white/60 mt-1">أضف أسماء وروابط شعارات الشركاء (اختياري)</p>
                        </div>
                        <button
                            type="button"
                            onClick={addPartner}
                            className="bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border border-white/10"
                        >
                            <Plus className="w-4 h-4" /> إضافة شريك
                        </button>
                    </div>

                    <div className="p-6 space-y-4">
                        <AnimatePresence>
                            {content.partners.map((partner, index) => (
                                <motion.div
                                    key={partner.id}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-black/30 border border-white/5 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-start md:items-center relative"
                                >
                                    <div className="absolute top-2 left-2 md:static opacity-50 font-mono text-xs">
                                        #{index + 1}
                                    </div>
                                    <div className="flex-1 w-full space-y-3">
                                        <div>
                                            <input
                                                type="text"
                                                value={partner.name}
                                                onChange={(e) => updatePartner(partner.id, 'name', e.target.value)}
                                                placeholder="اسم الشريك / العميل"
                                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-3 text-sm focus:outline-none focus:border-brand-red text-white"
                                                required
                                            />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {partner.logoUrl ? (
                                                <div className="w-16 h-12 bg-white/10 rounded-lg flex items-center justify-center overflow-hidden border border-white/20 p-1">
                                                    <img src={partner.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                                                </div>
                                            ) : (
                                                <div className="w-16 h-12 bg-white/5 rounded-lg flex items-center justify-center border border-white/10 border-dashed">
                                                    <ImageIcon className="w-5 h-5 text-white/30" />
                                                </div>
                                            )}
                                            <div className="flex-1 relative">
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (!file) return;
                                                        const reader = new FileReader();
                                                        reader.onload = (event) => {
                                                            const base64 = event.target?.result as string;
                                                            updatePartner(partner.id, 'logoUrl', base64);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                />
                                                <div className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 px-3 text-sm text-center text-white/70 transition-colors cursor-pointer flex justify-center items-center gap-2">
                                                    <ImageIcon className="w-4 h-4" />
                                                    {partner.logoUrl ? 'تغيير الشعار' : 'رفع الشعار (PNG, JPG, SVG)'}
                                                </div>
                                            </div>
                                            {partner.logoUrl && (
                                                <button
                                                    type="button"
                                                    onClick={() => updatePartner(partner.id, 'logoUrl', '')}
                                                    className="text-red-400 hover:text-red-300 text-xs font-medium px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 transition-colors"
                                                >
                                                    إزالة
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removePartner(partner.id)}
                                        className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all self-end md:self-center"
                                        title="حذف"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                        {content.partners.length === 0 && (
                            <div className="text-center py-10 text-white/40 text-sm">
                                لا يوجد شركاء. انقر على "إضافة شريك" لإضافة شركاء جدد.
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl p-6 shadow-2xl flex justify-between items-center">
                    <button
                        type="button"
                        onClick={handleReset}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-xs font-semibold rounded-xl transition-all border border-white/10 flex items-center gap-2 cursor-pointer"
                    >
                        <RotateCcw className="w-4 h-4" /> استعادة الأصلي
                    </button>

                    <button
                        type="submit"
                        className="bg-brand-red hover:bg-brand-red/90 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-brand-red/20 transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                        <Save className="w-5 h-5" /> حفظ التعديلات
                    </button>
                </div>
            </form>
        </div>
    );
}

