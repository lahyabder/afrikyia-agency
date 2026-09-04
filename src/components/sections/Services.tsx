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
        <section id="services" className="py-24 md:py-40 bg-brand-black relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-brand-red/5 to-transparent pointer-events-none" />
            <div className="container mx-auto px-6 relative z-10">
                <div className={`mb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">{t.services.tag}</h2>
                    <h3 className="text-white text-4xl md:text-6xl font-light tracking-wide">{t.services.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {t.services.list.map((service: any, idx: number) => {
                        const Icon = icons[idx];
                        return (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                whileHover={{ y: -10 }}
                                className={`group bg-white/5 backdrop-blur-xl p-10 rounded-3xl border border-white/5 hover:border-brand-red/30 hover:bg-white/10 transition-all duration-500 shadow-2xl hover:shadow-[0_0_50px_rgba(225,29,72,0.15)] ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                <div className={`w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center mb-8 group-hover:bg-brand-red/20 group-hover:border-brand-red/50 transition-all duration-500 ${isRTL ? 'mr-0' : ''}`}>
                                    <Icon className="w-7 h-7 text-white/80 group-hover:text-brand-red transition-colors duration-500" />
                                </div>
                                <h4 className="text-white text-xl font-bold mb-4 group-hover:text-brand-red transition-colors">
                                    {service.title}
                                </h4>
                                {service.desc && (
                                    <p className="text-white/70 text-sm leading-relaxed font-light">
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
