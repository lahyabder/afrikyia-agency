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
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-brand-red text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-8">
                            {t.vision.tag}
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, duration: 1 }}
                    >
                        <h3 className="text-white text-4xl md:text-7xl font-bold leading-[1.1] mb-12">
                            {t.vision.title.split(':').map((part, i) => (
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

                    <div className="grid md:grid-cols-2 gap-6 md:gap-24">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <p className="text-white/80 text-xl md:text-2xl font-normal leading-relaxed">
                                {t.vision.desc1}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <p className="text-white/80 text-xl md:text-2xl font-normal leading-relaxed">
                                {t.vision.desc2}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Vision;
