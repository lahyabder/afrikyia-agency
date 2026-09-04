"use client";

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

const Hero = () => {
    const { t, isRTL } = useLanguage();

    return (
        <section className="relative w-full min-h-[100dvh] bg-brand-black flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
            {/* Premium Ambient Glow */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-[10%] -left-[10%] w-[50rem] h-[50rem] bg-brand-red/10 rounded-full blur-[150px] mix-blend-screen" />
                <div className="absolute top-[40%] -right-[10%] w-[40rem] h-[40rem] bg-brand-red/5 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="z-10 flex flex-col items-center w-full max-w-7xl mx-auto"
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
                        className="max-w-[240px] sm:max-w-[280px] md:max-w-[400px] mb-8 md:mb-12 opacity-90"
                        style={{ filter: 'invert(1) hue-rotate(180deg) saturate(20)', mixBlendMode: 'screen' }}
                    />
                </motion.div>

                <div className="mb-6 md:mb-10 w-full">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        <h1 className="text-brand-red text-2xl sm:text-3xl md:text-5xl font-light tracking-wide block" dir={isRTL ? "rtl" : "ltr"}>
                            {t.hero.slogan}
                        </h1>
                    </motion.div>
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    className="max-w-3xl mx-auto text-brand-white/70 text-base md:text-2xl font-light leading-relaxed mb-10 md:mb-16"
                >
                    {t.hero.desc}
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    className="mb-12 md:mb-0"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-brand-red/90 backdrop-blur-md border border-brand-red/50 text-brand-white px-8 py-4 md:px-12 md:py-5 rounded-full text-base md:text-lg font-medium tracking-wide transition-all shadow-[0_0_40px_rgba(225,29,72,0.3)] hover:shadow-[0_0_60px_rgba(225,29,72,0.5)] group overflow-hidden relative"
                    >
                        <span className="relative z-10">{t.hero.cta}</span>
                        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
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
                <span className="text-brand-white/80 text-xs tracking-[0.3em] uppercase">{t.hero.scroll}</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-brand-red to-transparent relative overflow-hidden">
                    <motion.div
                        animate={{ y: [0, 64] }}
                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                        className="absolute top-0 left-0 w-full h-1/2 bg-brand-white/50"
                    />
                </div>
            </motion.div>
        </section>
    );
};

export default Hero;
