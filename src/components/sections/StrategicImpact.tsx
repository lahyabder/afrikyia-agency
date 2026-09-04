"use client";

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const StrategicImpact = () => {
    const { t, isRTL } = useLanguage();

    return (
        <section id="impact" className="py-24 md:py-40 bg-[#F8FAFC]">
            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    <div className={isRTL ? 'text-right' : 'text-left'}>
                        <motion.h2
                            initial={{ opacity: 0, x: isRTL ? 30 : -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-8"
                        >
                            {t.impact.tag}
                        </motion.h2>
                        <motion.h3
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            className="text-slate-900 text-4xl md:text-7xl font-bold leading-tight mb-12"
                        >
                            {t.impact.title.split(' ').map((word: string, i: number) => (
                                <span key={i}>
                                    {i === 2 && <br />}
                                    {word === 'Global' || word === 'العالمية' || word === 'Mondial' ? (
                                        <span className="text-brand-red">{word}</span>
                                    ) : (
                                        word
                                    )}{' '}
                                </span>
                            ))}
                        </motion.h3>
                        <p className="text-slate-600 text-xl font-light leading-relaxed mb-12">
                            {t.impact.desc}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {t.impact.list.map((impact: any, idx: number) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                                transition={{ delay: idx * 0.2 }}
                                className={`p-8 bg-white border border-slate-200 hover:border-brand-red/30 shadow-sm hover:shadow-md transition-all ${isRTL ? 'border-r-4 pr-8 border-r-brand-red text-right' : 'border-l-4 pl-8 border-l-brand-red text-left'}`}
                            >
                                <div className="text-brand-red text-xs uppercase tracking-widest mb-2 font-bold">{impact.label}</div>
                                <div className="text-slate-900 text-2xl md:text-3xl font-bold tracking-tight">{impact.value}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StrategicImpact;
