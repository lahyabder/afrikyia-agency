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
        <section className="py-20 md:py-32 bg-black border-t border-white/5 overflow-hidden">
            <div className="container mx-auto px-6 mb-16">
                <div className="flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">
                            {t.trusted.tag}
                        </h2>
                        <h3 className="text-white text-3xl md:text-5xl font-bold tracking-tight">
                            {t.trusted.title}
                        </h3>
                    </motion.div>
                </div>
            </div>

            {/* Logo Strip (Marquee) */}
            <div className="relative w-full flex overflow-hidden py-10">
                {/* Gradient Masks for smooth fading edges */}
                <div className="absolute top-0 bottom-0 left-0 w-24 md:w-64 z-10 bg-gradient-to-r from-black to-transparent pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-24 md:w-64 z-10 bg-gradient-to-l from-black to-transparent pointer-events-none" />
                
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
                            className="flex items-center justify-center min-w-max grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                        >
                            {/* TODO: If actual logo images are available, replace this text with <img src="..." alt={client} /> */}
                            <span className="text-2xl md:text-4xl font-extrabold tracking-widest text-white uppercase font-sans">
                                {client}
                            </span>
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
