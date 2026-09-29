"use client";

import { Languages, MemoryStick, Cpu, Library, Compass, Users, BookOpen, GraduationCap, Briefcase } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/lib/useSiteContent';

const icons = [Languages, MemoryStick, Cpu, Library, Compass, Users, BookOpen, GraduationCap, Briefcase];

const Services = () => {
    const { t } = useLanguage();
    const { content } = useSiteContent('services', {
        tag: t.services.tag,
        title: t.services.title,
        list: t.services.list as { title: string; desc?: string }[],
    });

    return (
        <section id="services" className="site-section bg-ground scroll-mt-16 lg:scroll-mt-[88px]">
            <div className="site-container">
                <div className="max-w-2xl">
                    <p className="text-brand-red text-sm font-bold">{content.tag}</p>
                    <h2 className="mt-4 text-ink text-3xl lg:text-5xl font-bold leading-tight">{content.title}</h2>
                </div>

                <div className="mt-8 lg:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
                    {(content.list || []).map((service, idx) => {
                        const Icon = icons[idx] || Briefcase;
                        return (
                            <div
                                key={idx}
                                className="flex sm:block gap-4 rounded-2xl bg-white border border-line p-5 sm:p-6 lg:p-8 hover:border-brand-red/40 transition-colors"
                            >
                                <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 rounded-lg bg-red-tint text-brand-red flex items-center justify-center">
                                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                                </div>
                                <div>
                                    <h3 className="sm:mt-6 text-ink text-base sm:text-lg lg:text-xl font-bold">{service.title}</h3>
                                    {service.desc && <p className="mt-1.5 sm:mt-2 text-muted text-sm sm:text-[15px] leading-relaxed">{service.desc}</p>}
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
