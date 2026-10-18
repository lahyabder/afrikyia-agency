"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle2, Sparkles, Layers, ShieldCheck, Cpu, Smartphone, Globe, Workflow, Database, Server, Terminal } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

const Hero = () => {
    const { t, isRTL, language } = useLanguage();
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
                { label: isRTL ? 'التوافر المستمر' : 'Haute Disponibilité', val: '99.98%' },
                { label: isRTL ? 'زمن الاستجابة' : 'Latence moyenne', val: '< 35ms' },
                { label: isRTL ? 'بروتوكول الأمان' : 'Chiffrement', val: 'TLS 1.3 / AES-256' },
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
                { label: isRTL ? 'وضع عدم الاتصال' : 'Mode Hors-ligne', val: 'IndexedDB Sync' },
                { label: isRTL ? 'سرعة التفاعل' : 'Score Performance', val: '99 / 100' },
                { label: isRTL ? 'التوافق' : 'Cross-Platform', val: 'iOS • Android • Web' },
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
                { label: isRTL ? 'دقة الاستخراج' : 'Précision OCR', val: '99.4%' },
                { label: isRTL ? 'توفير الوقت' : 'Gain de temps', val: '75%' },
                { label: isRTL ? 'التدقيق الآلي' : 'Audit Automatique', val: 'Audit Trail' },
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
        <section className="bg-white pt-20 lg:pt-28 pb-12 relative overflow-hidden">
            {/* Subtle background hairline grid */}
            <div 
                className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:24px_24px]"
                aria-hidden="true"
            />

            <div className="site-container relative z-10">
                <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center py-8 lg:py-16">
                    {/* Left Column: Bold Typography & Clear Value Proposition */}
                    <div className="lg:col-span-7">
                        <div className="inline-flex items-center gap-2.5 rounded-full bg-slate-50 border border-slate-200/90 px-4 py-1.5 shadow-2xs mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse" />
                            <span className="text-xs font-bold text-slate-800 tracking-wide">
                                {t.hero.badge || (isRTL ? 'تطوير البرمجيات والحلول الرقمية' : 'Développement logiciel & Solutions numériques')}
                            </span>
                        </div>

                        <h1 className="text-slate-900 font-extrabold tracking-tight text-3xl sm:text-5xl lg:text-6xl xl:text-[66px] leading-[1.14] sm:leading-[1.14]">
                            {t.hero.slogan}
                        </h1>

                        <p className="mt-6 text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl font-normal">
                            {t.hero.desc}
                        </p>

                        {/* High-Impact Minimalist CTAs */}
                        <div className="mt-9 flex flex-wrap items-center gap-4">
                            <Link
                                href="/#solutions"
                                id="hero-btn-solutions"
                                className="inline-flex items-center gap-2.5 h-13 px-8 rounded-xl bg-brand-red hover:bg-red-dark text-white font-bold text-base transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 duration-200"
                            >
                                <span>{t.hero.exploreSolutions || h.hero.primary || (isRTL ? 'استكشف حلولنا' : 'Explorer nos solutions')}</span>
                                <Arrow className="w-4 h-4" />
                            </Link>

                            <Link
                                href="/#contact"
                                id="hero-btn-contact"
                                className="inline-flex items-center h-13 px-8 rounded-xl bg-white border border-slate-200/90 hover:border-slate-400 hover:bg-slate-50 text-slate-800 font-bold text-base transition-all shadow-2xs hover:-translate-y-0.5 duration-200"
                            >
                                {t.hero.discussProject || h.hero.secondary || (isRTL ? 'ناقش مشروعك معنا' : 'Discuter de votre projet')}
                            </Link>
                        </div>

                        {/* Engineering Highlights */}
                        <div className="mt-10 pt-7 border-t border-slate-200/80 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                {isRTL ? 'تطبيقات ويب وهاتف عالية الأداء' : 'Applications Web & Mobiles'}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                {isRTL ? 'منصات سحابية قابلة للتوسع' : 'Architectures Cloud Scalables'}
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                {isRTL ? 'أمان متقدم ومزامنة دون إنترنت' : 'Haute Sécurité & Offline-First'}
                            </span>
                        </div>
                    </div>

                    {/* Right Column: Architectural Software Console (Proves Engineering Excellence) */}
                    <div className="lg:col-span-5">
                        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7 relative overflow-hidden">
                            {/* Window Header */}
                            <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-400" />
                                    <span className="w-3 h-3 rounded-full bg-amber-400" />
                                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                                    <span className="ms-2 font-mono text-[11px] font-semibold text-slate-400 tracking-wider">
                                        AFRIKYIA • Core Platform
                                    </span>
                                </div>
                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {isRTL ? 'جاهزية عالية' : 'Production Ready'}
                                </span>
                            </div>

                            {/* Interactive Capabilities Switcher */}
                            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl mb-6">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('cloud')}
                                    className={`py-2 px-2.5 text-xs font-bold rounded-lg transition-all text-center ${
                                        activeTab === 'cloud'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    {isRTL ? 'سحابية & APIs' : 'Cloud & APIs'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('mobile')}
                                    className={`py-2 px-2.5 text-xs font-bold rounded-lg transition-all text-center ${
                                        activeTab === 'mobile'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    {isRTL ? 'ويب وهاتف' : 'Web & Mobile'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('ai')}
                                    className={`py-2 px-2.5 text-xs font-bold rounded-lg transition-all text-center ${
                                        activeTab === 'ai'
                                            ? 'bg-white text-slate-900 shadow-2xs'
                                            : 'text-slate-500 hover:text-slate-900'
                                    }`}
                                >
                                    {isRTL ? 'أتمتة & OCR' : 'IA & OCR'}
                                </button>
                            </div>

                            {/* Active Tab Content Card */}
                            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-200/70">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                                            {currentTab.tag}
                                        </span>
                                        <h3 className="text-slate-900 font-bold text-base mt-2">
                                            {currentTab.title}
                                        </h3>
                                    </div>
                                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200/80 flex items-center justify-center text-brand-red shrink-0 shadow-2xs">
                                        {activeTab === 'cloud' && <Server className="w-5 h-5" />}
                                        {activeTab === 'mobile' && <Smartphone className="w-5 h-5" />}
                                        {activeTab === 'ai' && <Cpu className="w-5 h-5" />}
                                    </div>
                                </div>

                                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                                    {currentTab.subtitle}
                                </p>

                                {/* Live Engineering Specs Grid */}
                                <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-200/70 bg-white rounded-xl px-3 mb-4">
                                    {currentTab.specs.map((sp, i) => (
                                        <div key={i} className="text-center">
                                            <span className="block font-mono font-extrabold text-slate-900 text-xs sm:text-sm">
                                                {sp.val}
                                            </span>
                                            <span className="block text-[10px] text-slate-400 font-medium truncate">
                                                {sp.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Architecture Features */}
                                <ul className="space-y-2 text-xs text-slate-600 font-medium">
                                    {currentTab.features.map((feat, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red shrink-0" />
                                            <span>{feat}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Console Footer */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-brand-red" />
                                    <span>{isRTL ? 'هندسة برمجية متقدمة' : 'Ingénierie logicielle'}</span>
                                </span>
                                <Link
                                    href="/#solutions"
                                    className="font-bold text-slate-800 hover:text-brand-red transition-colors inline-flex items-center gap-1"
                                >
                                    <span>{isRTL ? 'استعراض كل الحلول' : 'Toutes les solutions'}</span>
                                    <Arrow className="w-3.5 h-3.5" />
                                </Link>
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
