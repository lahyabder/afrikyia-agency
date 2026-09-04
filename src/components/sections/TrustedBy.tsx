"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import achievements from '@/data/achievements.json';

// Unique clients extracted from the achievements array
const clients = Array.from(new Set(achievements.map(a => a.client))).filter(Boolean);

// Duplicate the array to create a seamless infinite loop
const marqueeItems = [...clients, ...clients, ...clients, ...clients];

const TrustedBy = () => {
    const { t, isRTL } = useLanguage();

    return (
        <section className="py-12 md:py-20 bg-white border-t border-slate-200 overflow-hidden">
            <div className="container mx-auto px-6 mb-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                    >
                        <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">
                            {t.trusted.tag}
                        </h2>
                        <h3 className="text-slate-900 text-3xl md:text-5xl font-bold tracking-tight">
                            {t.trusted.title}
                        </h3>
                    </motion.div>
                </div>
            </div>

            {/* Logo Strip (Marquee) */}
            <div className="relative w-full flex overflow-hidden py-10">
                {/* Gradient Masks for smooth fading edges */}
                <div className="absolute top-0 bottom-0 left-0 w-24 md:w-64 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-24 md:w-64 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                
                <motion.div
                    className="flex items-center gap-16 md:gap-32 whitespace-nowrap px-8"
                    animate={{
                        x: isRTL ? ["-50%", "0%"] : ["0%", "-50%"],
                    }}
                    transition={{
                        repeat: Infinity,
                        ease: "linear",
                        duration: 40,
                    }}
                >
                    {marqueeItems.map((client, index) => (
                        <div 
                            key={index} 
                            aria-hidden={index >= clients.length}
                            className="flex items-center justify-center min-w-max hover:scale-105 transition-transform duration-300"
                        >
                            {/* Empty Image Placeholder for Client Logo */}
                            <div className="w-48 h-20 md:w-56 md:h-24 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center px-4">
                                {/* TODO: Replace this div with actual logo: <img src="..." alt={client} className="max-w-full max-h-full object-contain" /> */}
                                <span className="text-slate-800 text-sm md:text-base font-bold text-center leading-snug">{client}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Testimonial Placeholder */}
            {/* 
                TODO: Add a real client testimonial block here when actual text is provided. 
                (Do not invent fake testimonials!)
            */}
        </section>
    );
};

export default TrustedBy;
