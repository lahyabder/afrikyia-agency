"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import {
    Languages,
    MemoryStick,
    Cpu,
    Library,
    Compass,
    Users,
    BookOpen,
    GraduationCap,
    Briefcase
} from 'lucide-react';

const icons = [Languages, MemoryStick, Cpu, Library, Compass, Users, BookOpen, GraduationCap, Briefcase];

const Services = () => {
    const { t, isRTL } = useLanguage();

    return (
        <section id="services" className="py-24 md:py-40 bg-[#F8FAFC] relative overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className={`mb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">{t.services.tag}</h2>
                    <h3 className="text-slate-900 text-4xl md:text-6xl font-light tracking-wide">{t.services.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {t.services.list.map((service: any, idx: number) => {
                        const Icon = icons[idx];

                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                whileHover={{ y: -5 }}
                                className={`group bg-white p-8 md:p-10 rounded-2xl border border-slate-200 hover:border-brand-red/30 hover:shadow-xl transition-all duration-300 shadow-sm flex flex-col justify-between ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                <div className={`w-14 h-14 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center mb-6 md:mb-8 group-hover:bg-brand-red/10 group-hover:border-brand-red/20 transition-all duration-300 ${isRTL ? 'mr-0' : ''}`}>
                                    <Icon className="w-7 h-7 text-slate-600 group-hover:text-brand-red transition-colors duration-300" />
                                </div>
                                <h4 className="text-slate-900 text-xl font-bold mb-4 group-hover:text-brand-red transition-colors duration-300">
                                    {service.title}
                                </h4>
                                {service.desc && (
                                    <p className="text-slate-600 text-base leading-relaxed font-normal">
                                        {service.desc}
                                    </p>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;
