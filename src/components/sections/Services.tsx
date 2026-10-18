"use client";

import { Smartphone, Globe, LayoutDashboard, Workflow, Cpu, Wrench, ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const solutionIcons = [
    Smartphone,      // 01 — App Development
    Globe,           // 02 — Digital Platforms
    LayoutDashboard, // 03 — Enterprise Systems
    Workflow,        // 04 — Automation & Integration
    Cpu,             // 05 — Artificial Intelligence
    Wrench,          // 06 — Maintenance & Evolution
];

interface SolutionItem {
    num?: string;
    title: string;
    subtitle?: string;
    desc?: string;
}

const Services = () => {
    const { t, isRTL } = useLanguage();
    const solutions = t.services;
    const items: SolutionItem[] = solutions.list || [];

    return (
        <section id="solutions" className="py-20 lg:py-28 bg-[#F8FAFC] border-t border-slate-200/80 scroll-mt-16 lg:scroll-mt-24 relative">
            {/* Backward compatibility anchor */}
            <span id="services" className="sr-only" aria-hidden="true" />

            <div className="site-container">
                <div className="max-w-3xl mb-14 lg:mb-20">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white border border-slate-200/80 px-3.5 py-1 text-xs font-bold text-brand-red mb-4 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        <span>{solutions.tag || (isRTL ? 'حلولنا' : 'Nos solutions')}</span>
                    </div>
                    <h2 className="text-slate-900 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                        {solutions.title}
                    </h2>
                    {solutions.desc && (
                        <p className="mt-4 text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
                            {solutions.desc}
                        </p>
                    )}
                </div>

                {/* 6 Minimalist Software Solutions Cards */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {items.map((service, idx) => {
                        const Icon = solutionIcons[idx] || Workflow;
                        const numStr = service.num || `0${idx + 1}`;

                        return (
                            <div
                                key={idx}
                                className="group bg-white rounded-2xl border border-slate-200/80 p-7 sm:p-8 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                            >
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="w-12 h-12 rounded-xl bg-rose-50 text-brand-red flex items-center justify-center group-hover:scale-105 group-hover:bg-brand-red group-hover:text-white transition-all duration-300">
                                            <Icon className="w-6 h-6 stroke-[1.8]" />
                                        </div>
                                        <span className="font-mono text-xs font-bold text-slate-400 tracking-wider">
                                            {numStr}
                                        </span>
                                    </div>

                                    <h3 className="text-slate-900 text-xl font-bold tracking-tight group-hover:text-brand-red transition-colors duration-200">
                                        {service.title}
                                    </h3>

                                    {service.subtitle && (
                                        <p className="mt-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                            {service.subtitle}
                                        </p>
                                    )}

                                    {service.desc && (
                                        <p className="mt-3.5 text-slate-600 text-sm sm:text-[15px] leading-relaxed font-normal">
                                            {service.desc}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-400 group-hover:text-brand-red transition-colors">
                                    <span>{isRTL ? 'حل برمجي معتمد' : 'Solution certifiée'}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200 group-hover:bg-brand-red transition-colors" />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;
