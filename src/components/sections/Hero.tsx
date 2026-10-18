"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Server, Smartphone, Cpu } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

const Hero = () => {
    const { t, isRTL } = useLanguage();
    const h = t.home;
    const Arrow = isRTL ? ArrowLeft : ArrowRight;

    // Interactive Architecture Preview Tab
    const [activeTab, setActiveTab] = useState<'cloud' | 'mobile' | 'ai'>('cloud');

    const stats = [
        { value: '06', label: h.stats.solutions || (isRTL ? 'مجالات حلول برمجية' : 'Pôles de solutions') },
        { value: '04', label: h.stats.products || (isRTL ? 'منتجات رقمية نشطة' : 'Produits numériques') },
        { value: '06', label: h.stats.stages || (isRTL ? 'مراحل هندسية منهجية' : 'Étapes méthodologiques') },
        { value: '03', label: h.stats.languages || (isRTL ? 'لغات مدعومة' : 'Langues prises en charge') },
    ];

    const tabData = {
        cloud: {
            title: isRTL ? 'هندسة الأنظمة السحابية والمنصات' : 'Architectures Cloud & Plateformes',
            subtitle: isRTL ? 'أنظمة مركزية قابلة للتوسع مع واجهات تكامل آمنة' : 'Systèmes scalables et API hautement sécurisées',
            tag: isRTL ? 'بيئة سحابية مرنة' : 'Cloud Native',
            specs: [
                { label: isRTL ? 'بروتوكول الأمان' : 'Chiffrement', val: 'TLS 1.3 / AES-256' },
                { label: isRTL ? 'زمن الاستجابة' : 'Latence moyenne', val: '< 35ms' },
                { label: isRTL ? 'التوافر المستمر' : 'Haute Disponibilité', val: '99.98%' },
            ],
            features: [
                isRTL ? 'بنية معمارية سحابية مستقلة لكل مؤسسة (Multi-Tenant)' : 'Architecture multi-tenant isolée',
                isRTL ? 'واجهات برمجية متقدمة (RESTful & GraphQL APIs)' : 'APIs RESTful et GraphQL documentées',
                isRTL ? 'قواعد بيانات متزامنة مع حماية من الفقدان والنسخ الاحتياطي' : 'Bases de données répliquées et sauvegardes continues',
            ],
        },
        mobile: {
            title: isRTL ? 'تطبيقات الويب والهواتف الذكية' : 'Applications Web & Mobiles',
            subtitle: isRTL ? 'تجارب مستخدم فائقة السرعة مع مزامنة بدون إنترنت' : 'Expériences natives et synchronisation hors-ligne',
            tag: isRTL ? 'تطبيقات تقدمية PWA' : 'Offline-First PWA',
            specs: [
                { label: isRTL ? 'التوافق' : 'Cross-Platform', val: 'iOS • Android • Web' },
                { label: isRTL ? 'سرعة التفاعل' : 'Score Performance', val: '99 / 100' },
                { label: isRTL ? 'وضع عدم الاتصال' : 'Mode Hors-ligne', val: 'IndexedDB Sync' },
            ],
            features: [
                isRTL ? 'واجهات استخدام سريعة ومصممة بدقة لتناسب احتياج السوق' : 'Interfaces utilisateur réactives et ergonomiques',
                isRTL ? 'مزامنة المعاملات تلقائياً عند عودة اتصال الإنترنت' : 'Synchronisation bidirectionnelle automatique',
                isRTL ? 'توافق تام مع مختلف الأجهزة والشاشات مع كود نظيف' : 'Base de code moderne et composants réutilisables',
            ],
        },
        ai: {
            title: isRTL ? 'أتمتة العمليات والذكاء الاصطناعي' : 'IA & Automatisation des Flux',
            subtitle: isRTL ? 'معالجة ذكية للوثائق والكشوفات واستخراج فوري للبيانات' : 'Extraction intelligente de données et OCR automatisé',
            tag: isRTL ? 'معالجة آلية' : 'Smart Automation',
            specs: [
                { label: isRTL ? 'التدقيق الآلي' : 'Audit Automatique', val: 'Audit Trail' },
                { label: isRTL ? 'توفير الوقت' : 'Gain de temps', val: '75%' },
                { label: isRTL ? 'دقة الاستخراج' : 'Précision OCR', val: '99.4%' },
            ],
            features: [
                isRTL ? 'تحليل رقمي فوري للإشعارات البنكية والمعاملات المالية' : 'Reconnaissance optique des reçus bancaires',
                isRTL ? 'أتمتة دورات العمل الإدارية والتقليل من الأخطاء البشرية' : 'Workflows automatisés et alertes intelligentes',
                isRTL ? 'تقارير تحليلية فورية تدعم اتخاذ القرارات المؤسسية' : 'Tableaux de bord d’aide à la décision en temps réel',
            ],
        },
    };

    const currentTab = tabData[activeTab];

    return (
        <section className="bg-white pt-24 lg:pt-32 pb-14 relative overflow-hidden">
            {/* Subtle background hairline grid */}
            <div 
                className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:24px_24px]"
                aria-hidden="true"
            />

            <div className="site-container relative z-10">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center py-6 lg:py-12">
                    {/* Hero Left Column (in RTL: Right side): Value proposition & CTAs */}
                    <div className="lg:col-span-6 xl:col-span-7">
                        <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-50 border border-slate-200/90 px-4 py-1.5 shadow-2xs mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                            <span className="text-xs font-bold text-slate-800 tracking-wide">
                                {t.hero.badge || (isRTL ? 'تطوير البرمجيات والحلول الرقمية' : 'Développement logiciel & Solutions numériques')}
                            </span>
                        </div>

                        <h1 className="text-slate-900 font-black tracking-tight text-3xl sm:text-5xl lg:text-6xl xl:text-[62px] leading-[1.15]">
                            {t.hero.slogan}
                        </h1>

                        <p className="mt-6 text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl font-normal">
                            {t.hero.desc}
                        </p>

                        {/* High-Impact CTAs */}
                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            <Link
                                href="/#solutions"
                                id="hero-btn-solutions"
                                className="inline-flex items-center gap-2.5 h-13 px-8 rounded-xl bg-brand-red hover:bg-red-dark text-white font-extrabold text-base transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200"
                            >
                                <span>{t.hero.exploreSolutions || h.hero.primary || (isRTL ? 'استكشف حلولنا' : 'Explorer nos solutions')}</span>
                                <Arrow className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/#contact"
                                id="hero-btn-contact"
                                className="inline-flex items-center h-13 px-8 rounded-xl bg-white border border-slate-200/90 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-extrabold text-base transition-all shadow-2xs hover:-translate-y-0.5 duration-200"
                            >
                                {t.hero.discussProject || h.hero.secondary || (isRTL ? 'ناقش مشروعك معنا' : 'Discuter de votre projet')}
                            </Link>
                        </div>

                        {/* Engineering Highlights */}
                        <div className="mt-10 pt-7 border-t border-slate-200/80 flex flex-wrap items-center gap-5 text-xs sm:text-sm font-semibold text-slate-700">
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                {isRTL ? 'تطبيقات ويب وهاتف عالية الأداء' : 'Applications Web & Mobiles'}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                {isRTL ? 'منصات سحابية قابلة للتوسع' : 'Architectures Cloud Scalables'}
                            </span>
                            <span className="inline-flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                {isRTL ? 'أمان متقدم ومزامنة دون إنترنت' : 'Haute Sécurité & Offline-First'}
                            </span>
                        </div>
                    </div>

                    {/* Hero Right Column (in RTL: Left side): Architectural Software Console */}
                    <div className="lg:col-span-6 xl:col-span-5">
                        {/* Outer Dot Matrix Workbench Frame */}
                        <div className="relative p-2.5 sm:p-4 rounded-[32px] sm:rounded-[36px] bg-slate-50/70 border border-slate-200/80 shadow-xl shadow-slate-200/50 backdrop-blur-xs">
                            {/* Subtle dot matrix pattern */}
                            <div 
                                className="absolute inset-0 rounded-[32px] sm:rounded-[36px] opacity-40 pointer-events-none bg-[radial-gradient(#94a3b8_1px,transparent_1px)] [background-size:18px_18px]"
                                aria-hidden="true"
                            />

                            {/* White Interactive Console Card */}
                            <div className="relative z-10 bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
                                {/* Window Header Bar */}
                                <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100" dir="ltr">
                                    <span className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        {isRTL ? 'جاهزية عالية' : 'Production Ready'}
                                    </span>

                                    <span className="font-mono text-xs sm:text-[13px] font-bold text-slate-500 tracking-wider">
                                        AFRIKYIA • Core Platform
                                    </span>

                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-[#10B981]" />
                                        <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                                        <span className="w-3 h-3 rounded-full bg-[#F43F5E]" />
                                    </div>
                                </div>

                                {/* Segmented Capabilities Switcher Tabs */}
                                <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-[#EEF2F6] rounded-2xl mb-5">
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('cloud')}
                                        className={`py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 text-center ${
                                            activeTab === 'cloud'
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900 font-bold'
                                        }`}
                                    >
                                        {isRTL ? 'سحابية & APIs' : 'Cloud & APIs'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('mobile')}
                                        className={`py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 text-center ${
                                            activeTab === 'mobile'
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900 font-bold'
                                        }`}
                                    >
                                        {isRTL ? 'ويب وهاتف' : 'Web & Mobile'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setActiveTab('ai')}
                                        className={`py-2.5 px-2 sm:px-3 text-xs sm:text-sm font-black rounded-xl transition-all duration-200 text-center ${
                                            activeTab === 'ai'
                                                ? 'bg-white text-slate-900 shadow-sm'
                                                : 'text-slate-500 hover:text-slate-900 font-bold'
                                        }`}
                                    >
                                        {isRTL ? 'أتمتة & OCR' : 'IA & OCR'}
                                    </button>
                                </div>

                                {/* Active Tab Content Card */}
                                <div className="bg-slate-50/70 rounded-2xl p-5 sm:p-6 border border-slate-200/80">
                                    {/* Icon & Tag Row */}
                                    <div className="flex items-center justify-between gap-4 mb-3" dir="ltr">
                                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-center text-brand-red shrink-0">
                                            {activeTab === 'cloud' && <Server className="w-6 h-6 stroke-[2.2]" />}
                                            {activeTab === 'mobile' && <Smartphone className="w-6 h-6 stroke-[2.2]" />}
                                            {activeTab === 'ai' && <Cpu className="w-6 h-6 stroke-[2.2]" />}
                                        </div>
                                        <span className="text-xs font-bold text-brand-red bg-rose-50 border border-rose-100/90 px-3 py-1 rounded-full">
                                            {currentTab.tag}
                                        </span>
                                    </div>

                                    {/* Title & Subtitle */}
                                    <h3 className="text-slate-900 font-black text-lg sm:text-xl mt-3 tracking-tight">
                                        {currentTab.title}
                                    </h3>
                                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mt-1">
                                        {currentTab.subtitle}
                                    </p>

                                    {/* Specs Grid */}
                                    <div className="grid grid-cols-3 gap-2 py-3.5 my-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs px-3" dir="ltr">
                                        {currentTab.specs.map((sp, i) => (
                                            <div key={i} className="text-center">
                                                <span className="block font-mono font-black text-slate-900 text-xs sm:text-sm">
                                                    {sp.val}
                                                </span>
                                                <span className="block text-[11px] text-slate-400 font-semibold mt-0.5 truncate">
                                                    {sp.label}
                                                </span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Architecture Features with Red Bullets */}
                                    <ul className="space-y-2.5 text-xs sm:text-[13px] text-slate-700 font-semibold">
                                        {currentTab.features.map((feat, i) => (
                                            <li key={i} className="flex items-center gap-2.5">
                                                <span className="w-2 h-2 rounded-full bg-brand-red shrink-0" />
                                                <span>{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Console Footer */}
                                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs sm:text-sm" dir="ltr">
                                    <Link
                                        href="/#solutions"
                                        className="font-black text-slate-900 hover:text-brand-red transition-colors inline-flex items-center gap-1.5"
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                        <span>{isRTL ? 'استعراض كل الحلول' : 'Toutes les solutions'}</span>
                                    </Link>
                                    <span className="flex items-center gap-1.5 font-bold text-slate-700">
                                        <span>{isRTL ? 'هندسة برمجية متقدمة' : 'Ingénierie logicielle'}</span>
                                        <Sparkles className="w-4 h-4 text-brand-red" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimalist Key Metric Strip with RTL-Safe Dividers */}
                <div className="mt-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
                    <div className="grid grid-cols-2 lg:grid-cols-4">
                        {stats.map((s, idx) => (
                            <div 
                                key={s.label} 
                                className={`p-6 sm:p-8 text-center sm:text-start border-b lg:border-b-0 border-slate-100 sm:border-e sm:border-slate-200/80 ${
                                    idx === stats.length - 1 ? 'sm:border-e-0' : ''
                                }`}
                            >
                                <div className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                                    {s.value}
                                </div>
                                <div className="mt-1 text-xs sm:text-sm font-semibold text-slate-500">
                                    {s.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
