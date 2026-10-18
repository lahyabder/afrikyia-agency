"use client";

import Image from 'next/image';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';

const Hero = () => {
    const { t, isRTL } = useLanguage();
    const h = t.home;
    const Arrow = isRTL ? ArrowLeft : ArrowRight;

    const stats = [
        { value: '06', label: h.stats.solutions || (isRTL ? 'مجالات حلول برمجية' : 'Pôles de solutions') },
        { value: '04', label: h.stats.products || (isRTL ? 'منتجات رقمية نشطة' : 'Produits numériques') },
        { value: '06', label: h.stats.stages || (isRTL ? 'مراحل هندسية منهجية' : 'Étapes méthodologiques') },
        { value: '03', label: h.stats.languages || (isRTL ? 'لغات مدعومة' : 'Langues prises en charge') },
    ];

    return (
        <section className="bg-white pt-24 lg:pt-32 pb-14 relative overflow-hidden">
            {/* Subtle background hairline grid */}
            <div 
                className="absolute inset-0 opacity-[0.035] pointer-events-none bg-[radial-gradient(#0F172A_1px,transparent_1px)] [background-size:24px_24px]"
                aria-hidden="true"
            />

            <div className="site-container relative z-10">
                <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center py-6 lg:py-12">
                    {/* Left Column (in RTL: Right side): Value proposition & CTAs */}
                    <div className="lg:col-span-7 xl:col-span-7">
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

                    {/* Right Column (in RTL: Left side): Animated Binary Spiral */}
                    <div className="lg:col-span-5 xl:col-span-5 flex items-center justify-center">
                        <div className="relative w-full max-w-[420px] sm:max-w-[460px] lg:max-w-[500px] xl:max-w-[540px] aspect-square flex items-center justify-center select-none group">
                            {/* Subtle Ambient Radial Glow */}
                            <div 
                                className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(225,29,72,0.07)_0%,rgba(15,23,42,0.02)_45%,transparent_72%)] pointer-events-none scale-125" 
                                aria-hidden="true"
                            />

                            {/* Counter-rotating subtle orbital ring */}
                            <div 
                                className="absolute w-[94%] h-[94%] rounded-full border border-slate-200/40 border-dashed animate-spiral-spin-reverse pointer-events-none" 
                                aria-hidden="true"
                            />

                            {/* Animated Hypnotic Binary Spiral */}
                            <div className="relative w-full h-full flex items-center justify-center animate-spiral-vortex transition-transform duration-700 ease-out group-hover:scale-[1.03]">
                                <Image
                                    src="/binary-spiral.png"
                                    alt="AFRIKYIA Binary Architecture Spiral"
                                    width={540}
                                    height={540}
                                    priority
                                    className="w-full h-full object-contain animate-spiral-spin select-none pointer-events-none drop-shadow-xs"
                                />

                                {/* Central Digital Vortex Core (Pulsar) */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-brand-red/25 blur-xs animate-ping pointer-events-none" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-brand-red shadow-sm shadow-brand-red pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Minimalist Key Metric Strip with RTL-Safe Dividers */}
                <div className="mt-6 lg:mt-10 rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
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
