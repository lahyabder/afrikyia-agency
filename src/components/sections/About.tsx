"use client";

import { ShieldCheck, Zap, Maximize2, Building, FileCheck2, Hash, Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const About = () => {
    const { t, isRTL } = useLanguage();
    const about = t.about;
    const legal = about.legal;

    const corePillars = [
        {
            icon: ShieldCheck,
            title: isRTL ? 'البساطة والوضوح' : 'Simplicité & Clarté',
            desc: isRTL
                ? 'واجهات وتجارب استخدام مباشرة تبتعد عن التعقيد وتضع سهولة الوصول وتجربة المستخدم في المقام الأول.'
                : 'Des interfaces intuitives et épurées éliminant toute complexité inutile pour l’utilisateur.',
        },
        {
            icon: Zap,
            title: isRTL ? 'الكفاءة والسرعة' : 'Efficacité & Rapidité',
            desc: isRTL
                ? 'برمجيات محسنة للأداء بأعلى درجات الاستجابة، مع استهلاك أمثل لموارد الخوادم والشبكة.'
                : 'Des architectures optimisées garantissant des temps de réponse ultra-rapides et une haute disponibilité.',
        },
        {
            icon: Maximize2,
            title: isRTL ? 'قابلية التوسع' : 'Évolutivité & Scalabilité',
            desc: isRTL
                ? 'أنظمة هندسية صلبة قادرة على النمو مع توسع أعمالك وزيادة أعداد المستخدمين دون انقطاع.'
                : 'Des socles techniques pérennes capables d’accompagner la croissance de votre activité sans friction.',
        },
    ];

    return (
        <section id="about" className="py-20 lg:py-28 bg-white border-t border-slate-200/80 scroll-mt-16 lg:scroll-mt-24">
            <div className="site-container">
                <div className="max-w-3xl mb-12 lg:mb-16">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/80 px-3.5 py-1 text-xs font-bold text-brand-red mb-4 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        <span>{about.tag || (isRTL ? 'عن AFRIKYIA' : 'À propos d’AFRIKYIA')}</span>
                    </div>
                    <h2 className="text-slate-900 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
                        {about.title}
                    </h2>
                </div>

                {/* Primary Corporate Statement — Executive Light Design */}
                <div className="rounded-3xl bg-slate-50/80 border border-slate-200/90 p-8 sm:p-10 lg:p-14 relative overflow-hidden shadow-xs border-s-4 border-s-brand-red">
                    <div className="max-w-4xl relative z-10">
                        <div className="flex items-center gap-2 text-brand-red font-mono text-xs font-bold uppercase tracking-wider mb-4">
                            <Sparkles className="w-4 h-4" />
                            <span>Corporate Identity • AFRIKYIA</span>
                        </div>

                        <blockquote className="text-xl sm:text-2xl lg:text-3xl font-bold leading-relaxed sm:leading-relaxed text-slate-900">
                            «{about.desc1}»
                        </blockquote>

                        {about.desc2 && (
                            <p className="mt-6 text-slate-600 text-base sm:text-lg leading-relaxed max-w-3xl font-normal">
                                {about.desc2}
                            </p>
                        )}
                    </div>
                </div>

                {/* Core Pillars: Simplicity, Efficiency, Scalability */}
                <div className="mt-8 lg:mt-12 grid sm:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                    {corePillars.map((p, idx) => (
                        <div
                            key={idx}
                            className="rounded-2xl border border-slate-200/80 bg-white p-7 lg:p-8 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                        >
                            <div>
                                <div className="w-12 h-12 rounded-xl bg-rose-50 text-brand-red border border-rose-100/70 flex items-center justify-center shadow-2xs mb-6">
                                    <p.icon className="w-6 h-6 stroke-[1.8]" />
                                </div>
                                <h3 className="text-slate-900 text-xl font-bold tracking-tight">{p.title}</h3>
                                <p className="mt-3 text-slate-600 text-sm sm:text-[15px] leading-relaxed font-normal">{p.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Official Legal & Institutional Registry Card */}
                {legal && (
                    <div className="mt-8 lg:mt-12 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-6 sm:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                                    {isRTL ? 'البيانات الرسمية والقانونية' : 'Informations légales & institutionnelles'}
                                </span>
                                <h4 className="mt-1 text-slate-900 font-extrabold text-lg sm:text-xl">
                                    AFRIKYIA Software & Digital Solutions
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-xs font-medium text-slate-600">
                                <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-2xs">
                                    <Building className="w-4 h-4 text-brand-red shrink-0" />
                                    <div>
                                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">{legal.addressTitle}</span>
                                        <span className="font-bold text-slate-800">{legal.address}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-2xs">
                                    <FileCheck2 className="w-4 h-4 text-brand-red shrink-0" />
                                    <div>
                                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">{legal.rcTitle}</span>
                                        <span className="font-mono font-bold text-slate-800" dir="ltr">{legal.rc}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-white border border-slate-200/80 px-4 py-3 rounded-xl shadow-2xs">
                                    <Hash className="w-4 h-4 text-brand-red shrink-0" />
                                    <div>
                                        <span className="block text-[10px] text-slate-400 font-semibold uppercase">{legal.nifTitle}</span>
                                        <span className="font-mono font-bold text-slate-800" dir="ltr">{legal.nif}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default About;
