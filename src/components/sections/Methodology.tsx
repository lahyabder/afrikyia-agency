"use client";

import { Compass, Layout, Code2, ShieldCheck, Rocket, RefreshCw, ArrowRight, ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const stepIcons = [
    Compass,    // 01 — Analysis & Scoping
    Layout,     // 02 — UX/UI Design
    Code2,      // 03 — Development
    ShieldCheck,// 04 — Testing & QA
    Rocket,     // 05 — Cloud Deployment
    RefreshCw,  // 06 — Maintenance & Evolution
];

interface StepItem {
    num: string;
    title: string;
    subtitle: string;
    desc: string;
}

const Methodology = () => {
    const { t, isRTL } = useLanguage();
    const m = t.methodology;
    const steps: StepItem[] = m?.steps || [];
    const Arrow = isRTL ? ArrowLeft : ArrowRight;

    return (
        <section id="methodology" className="py-20 lg:py-28 bg-[#F8FAFC] border-t border-slate-200/80 scroll-mt-16 lg:scroll-mt-24 relative">
            <div className="site-container">
                <div className="max-w-3xl mb-14 lg:mb-20">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200/80 px-3.5 py-1 text-xs font-bold text-brand-red mb-4 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        <span>{m?.tag || (isRTL ? 'منهجيتنا' : 'Notre méthode')}</span>
                    </div>
                    <h2 className="text-slate-900 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                        {m?.title || (isRTL ? 'مسار تطوير البرمجيات من الفكرة إلى الحل الرقمي' : "Le cycle de développement : de l'idée au déploiement")}
                    </h2>
                    <p className="mt-4 text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
                        {m?.desc || (isRTL ? 'نعتمد نهجاً هندسياً متكاملاً يتكون من ست مراحل واضحة تضمن بناء برمجيات عالية الجودة، مستقرة، وقابلة للتوسع المستمر.' : 'Une démarche d’ingénierie rigoureuse en six étapes pour concevoir des produits logiciels fiables, performants et pérennes.')}
                    </p>
                </div>

                {/* 6-Stage Sequential Grid with Ultra-Clean Modern Styling */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {steps.map((step, idx) => {
                        const Icon = stepIcons[idx] || Code2;
                        const isLast = idx === steps.length - 1;

                        return (
                            <div
                                key={step.num || idx}
                                className="group relative rounded-2xl bg-white border border-slate-200/80 p-7 sm:p-8 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-brand-red border border-rose-100/70 flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-red group-hover:text-white transition-all duration-300 shadow-2xs">
                                            <Icon className="w-6 h-6 stroke-[1.8]" />
                                        </div>
                                        <span className="font-mono text-xs font-extrabold text-slate-400 tracking-wider">
                                            {step.num}
                                        </span>
                                    </div>

                                    <h3 className="text-slate-900 text-xl font-bold tracking-tight group-hover:text-brand-red transition-colors duration-200">
                                        {step.title}
                                    </h3>
                                    
                                    <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                        {step.subtitle}
                                    </p>

                                    <p className="mt-3.5 text-slate-600 text-sm sm:text-[15px] leading-relaxed font-normal">
                                        {step.desc}
                                    </p>
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 group-hover:text-brand-red transition-colors">
                                    <span className="font-mono font-semibold">Stage {step.num} / 06</span>
                                    {!isLast ? (
                                        <Arrow className="w-4 h-4 text-slate-400 group-hover:text-brand-red transition-colors" />
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span>{isRTL ? 'جاهز للإنتاج' : 'Production Ready'}</span>
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Methodology;
