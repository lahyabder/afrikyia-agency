"use client";

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const Vision = () => {
    const { t, isRTL } = useLanguage();

    return (
        <section id="vision" className="py-16 md:py-32 bg-black selection:bg-brand-red selection:text-white">
            <div className="container mx-auto px-6">
                <div className={`max-w-5xl ${isRTL ? 'text-right' : 'text-left'}`}>
                    <motion.div
                        initial={{ opacity: 0, x: isRTL ? 50 : -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-brand-red text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-8">
                            {t.vision.tag}
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ delay: 0.2, duration: 1 }}
                    >
                        <h3 className="text-white text-4xl md:text-7xl font-bold leading-[1.1] mb-12">
                            {t.vision.title.split(':').map((part: string, i: number) => (
                                <span key={i}>
                                    {i === 0 ? (
                                        <>{part}: <br /></>
                                    ) : (
                                        <span className="text-brand-red font-medium">{part}</span>
                                    )}
                                </span>
                            ))}
                        </h3>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-6 md:gap-24 mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <p className="text-white/80 text-xl md:text-2xl font-normal leading-relaxed">
                                {t.vision.desc1}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <p className="text-white/80 text-xl md:text-2xl font-normal leading-relaxed">
                                {t.vision.desc2}
                            </p>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                        className="grid md:grid-cols-2 gap-12 pt-16 border-t border-white/10"
                    >
                        <div>
                            <h4 className="text-brand-red text-xl font-bold mb-4">{t.vision.whatWeBuild}</h4>
                            <p className="text-white/70 text-lg leading-relaxed">{t.vision.whatWeBuildDesc}</p>
                        </div>
                        <div>
                            <h4 className="text-brand-red text-xl font-bold mb-4">{t.vision.forWhom}</h4>
                            <p className="text-white/70 text-lg leading-relaxed">{t.vision.forWhomDesc}</p>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ delay: 1, duration: 0.8 }}
                        className="grid grid-cols-2 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/10"
                    >
                        {t.vision.stats.map((stat: any, index: number) => (
                            <div key={index} className="flex flex-col gap-2">
                                <span className="text-4xl md:text-6xl font-bold text-white">{stat.value}</span>
                                <span className="text-white/70 text-sm md:text-base font-medium uppercase tracking-wider">{stat.label}</span>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Vision;
