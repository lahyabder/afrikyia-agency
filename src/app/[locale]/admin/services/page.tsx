"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Save, AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react';
import arMessages from '../../../../../messages/ar.json';
import frMessages from '../../../../../messages/fr.json';
import enMessages from '../../../../../messages/en.json';

type ServiceItem = {
    title: string;
    desc: string;
};

type ServicesContent = {
    tag: string;
    title: string;
    list: ServiceItem[];
};

type ServicesTranslations = {
    ar: ServicesContent;
    fr: ServicesContent;
    en: ServicesContent;
};

export default function AdminServicesPage() {
    const { t, isRTL } = useLanguage();
    
    // Data State
    const [content, setContent] = useState<ServicesTranslations>({
        ar: arMessages.services,
        fr: frMessages.services,
        en: enMessages.services
    });
    
    const [formLanguageTab, setFormLanguageTab] = useState<'ar' | 'fr' | 'en'>('ar');
    const [notification, setNotification] = useState<{ type: 'success' | 'warn' | 'error'; message: string } | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        const cached = localStorage.getItem('afrikyia-services');
        if (cached) {
            try {
                setContent(JSON.parse(cached));
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
        localStorage.setItem('afrikyia-services', JSON.stringify(content));
        window.dispatchEvent(new Event('afrikyia-services-updated'));
        showNotification('success', 'تم حفظ التعديلات بنجاح | Saved successfully');
    };

    const handleReset = () => {
        if (!confirm('هل أنت متأكد من استعادة النصوص الأصلية وإلغاء كافة التعديلات؟\nAre you sure you want to reset to default texts?')) return;
        const original = {
            ar: arMessages.services,
            fr: frMessages.services,
            en: enMessages.services
        };
        setContent(original);
        localStorage.removeItem('afrikyia-services');
        window.dispatchEvent(new Event('afrikyia-services-updated'));
        showNotification('success', 'تمت استعادة النصوص الأصلية بنجاح | Reset to default successfully');
    };

    const handleContentChange = (field: keyof ServicesContent, value: string) => {
        setContent(prev => ({
            ...prev,
            [formLanguageTab]: {
                ...prev[formLanguageTab],
                [field]: value
            }
        }));
    };

    const handleServiceItemChange = (index: number, field: keyof ServiceItem, value: string) => {
        setContent(prev => {
            const newList = [...prev[formLanguageTab].list];
            newList[index] = {
                ...newList[index],
                [field]: value
            };
            
            return {
                ...prev,
                [formLanguageTab]: {
                    ...prev[formLanguageTab],
                    list: newList
                }
            };
        });
    };

    if (!isMounted) return <div className="min-h-screen bg-[#080808]"></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-20">
            {/* Header Row */}
            <div className={`flex flex-col md:flex-row justify-between items-center bg-black/40 border border-white/5 p-6 rounded-2xl gap-6 ${isRTL ? 'flex-row' : 'flex-row'}`}>
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-xl font-bold">{t.admin.menu.services || 'الخدمات'}</h1>
                        <p className="text-xs text-white/70">تعديل نصوص قسم الخدمات / خبراتنا</p>
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

            {/* Form */}
            <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/10 bg-black/50">
                    <h2 className="text-lg font-bold text-white">تعديل المحتوى</h2>
                    <p className="text-xs text-white/60 mt-1">يجب إدخال النصوص باللغات الثلاث لضمان ظهورها بشكل صحيح</p>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-8">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Tag */}
                            <div>
                                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">العلامة (Tag)</label>
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
                                <label className="block text-xs font-bold text-white/60 uppercase tracking-wider mb-2">العنوان الرئيسي (Title)</label>
                                <input
                                    type="text"
                                    value={content[formLanguageTab].title}
                                    onChange={(e) => handleContentChange('title', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:border-brand-red text-white"
                                    required
                                />
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="pt-6 border-t border-white/5 space-y-6">
                            <h3 className="text-sm font-bold text-white mb-4">قائمة الخدمات (9 خدمات)</h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {content[formLanguageTab].list.map((item, index) => (
                                    <div key={index} className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-4">
                                        <div className="text-xs font-bold text-brand-red mb-2">الخدمة #{index + 1}</div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">اسم الخدمة</label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => handleServiceItemChange(index, 'title', e.target.value)}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-red text-white text-sm"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-[10px] font-bold text-white/60 uppercase tracking-wider mb-1">الوصف</label>
                                            <textarea
                                                value={item.desc}
                                                onChange={(e) => handleServiceItemChange(index, 'desc', e.target.value)}
                                                rows={2}
                                                className="w-full bg-black/50 border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:border-brand-red text-white text-sm resize-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/10 flex justify-between items-center">
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
        </div>
    );
}
