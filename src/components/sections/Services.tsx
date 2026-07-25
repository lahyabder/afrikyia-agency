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
        <section id="services" className="py-24 md:py-40 bg-black">
            <div className="container mx-auto px-6">
                <div className={`mb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">{t.services.tag}</h2>
                    <h3 className="text-white text-4xl md:text-6xl font-bold">{t.services.title}</h3>
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
                                className={`group bg-white/5 p-10 rounded-2xl border border-white/10 hover:border-brand-red transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-brand-red/10 ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                <div className={`w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-8 group-hover:bg-brand-red transition-colors duration-300 ${isRTL ? 'mr-0' : ''}`}>
                                    <Icon className="w-7 h-7 text-white group-hover:text-white transition-colors duration-300" />
                                </div>
                                <h4 className="text-white text-xl font-bold mb-4 group-hover:text-brand-red transition-colors">
                                    {service.title}
                                </h4>

                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Services;
