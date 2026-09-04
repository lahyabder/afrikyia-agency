"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const Hero = () => {
    const { t, isRTL } = useLanguage();

    return (
        <section className="relative w-full min-h-[100dvh] bg-[#F8FAFC] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="z-10 flex flex-col items-center w-full max-w-7xl mx-auto mt-16"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                >
                    <Image
                        src="/logo.png"
                        alt="Afrikyia Official Logo"
                        width={600}
                        height={200}
                        className="max-w-[240px] sm:max-w-[280px] md:max-w-[400px] mb-8 md:mb-12"
                    />
                </motion.div>

                <div className="mb-6 md:mb-10 w-full">
                    <h1 className="text-slate-900 text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight block flex flex-wrap justify-center gap-x-3 gap-y-2" dir={isRTL ? "rtl" : "ltr"}>
                        {t.hero.slogan.split(' ').map((word: string, wordIdx: number) => (
                            <span key={wordIdx} className="inline-block overflow-hidden pb-2">
                                <motion.span 
                                    className="inline-block"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + (wordIdx * 0.15), duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}
                                >
                                    {word}
                                </motion.span>
                            </span>
                        ))}
                    </h1>
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="max-w-3xl mx-auto text-slate-600 text-base md:text-2xl font-light leading-relaxed mb-10 md:mb-16"
                >
                    {t.hero.desc}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="mb-12 md:mb-0"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-brand-red text-white px-10 py-4 md:px-14 md:py-5 rounded-full text-base md:text-lg font-medium tracking-wide transition-all shadow-xl shadow-brand-red/20 hover:shadow-2xl hover:shadow-brand-red/30 hover:bg-[#EB2F36]"
                    >
                        {t.hero.cta}
                    </motion.button>
                </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
            >
                <span className="text-slate-400 text-xs tracking-[0.3em] uppercase">{t.hero.scroll}</span>
                <div className="w-[1px] h-16 bg-slate-200 relative overflow-hidden">
                    <motion.div
                        animate={{ y: [0, 64] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute top-0 left-0 w-full h-1/2 bg-brand-red"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
