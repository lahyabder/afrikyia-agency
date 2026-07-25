"use client";

import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

const About = () => {
    const { t, isRTL } = useLanguage();

    return (
        <section id="about" className="py-16 md:py-32 bg-black border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className={`max-w-5xl mx-auto ${isRTL ? 'text-right' : 'text-left'}`}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h2 className="text-brand-red text-sm md:text-base font-bold uppercase tracking-[0.4em] mb-8">
                            {t.about.tag}
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                        transition={{ delay: 0.2, duration: 1 }}
                    >
                        <h3 className="text-white text-4xl md:text-6xl font-bold leading-[1.2] mb-12">
                            {t.about.title}
                        </h3>
                    </motion.div>

                    <div className="grid md:grid-cols-2 gap-8 md:gap-16">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            <p className="text-white/80 text-lg md:text-xl font-normal leading-relaxed">
                                {t.about.desc1}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                            transition={{ delay: 0.6, duration: 0.8 }}
                        >
                            <p className="text-white/80 text-lg md:text-xl font-normal leading-relaxed">
                                {t.about.desc2}
                            </p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default About;
