"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import achievements from '@/data/achievements.json';

// Fallback clients
const defaultClients = Array.from(new Set(achievements.map(a => a.client))).filter(Boolean).map((name, i) => ({
    id: String(i),
    name: name as string,
    logoUrl: ""
}));

const TrustedBy = () => {
    const { t, isRTL, language } = useLanguage();

    const [content, setContent] = useState({
        tag: t.trusted.tag,
        title: t.trusted.title
    });
    
    const [partners, setPartners] = useState(defaultClients);

    useEffect(() => {
        const loadContent = () => {
            const cached = localStorage.getItem('afrikyia-trusted');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed[language]) {
                        setContent(parsed[language]);
                    }
                    if (parsed.partners && Array.isArray(parsed.partners)) {
                        setPartners(parsed.partners);
                    } else {
                        setPartners(defaultClients);
                    }
                } catch (e) {
                    console.error(e);
                }
            } else {
                setContent({
                    tag: t.trusted.tag,
                    title: t.trusted.title
                });
                setPartners(defaultClients);
            }
        };

        loadContent();

        window.addEventListener('afrikyia-trusted-updated', loadContent);
        return () => window.removeEventListener('afrikyia-trusted-updated', loadContent);
    }, [language, t]);

    // Duplicate the array to create a seamless infinite loop
    const marqueeItems = [...partners, ...partners, ...partners, ...partners];

    return (
        <section className="py-10 md:py-16 bg-white border-t border-slate-200 overflow-hidden">
            <div className="container mx-auto px-6 mb-8">
                <div className="flex flex-col items-center justify-center text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                    >
                        <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">
                            {content.tag}
                        </h2>
                        <h3 className="text-slate-900 text-3xl md:text-5xl font-bold tracking-tight">
                            {content.title}
                        </h3>
                    </motion.div>
                </div>
            </div>

            {/* Logo Strip (Marquee) */}
            <div className="relative w-full flex overflow-hidden py-4">
                {/* Gradient Masks for smooth fading edges */}
                <div className="absolute top-0 bottom-0 left-0 w-24 md:w-64 z-10 bg-gradient-to-r from-white to-transparent pointer-events-none" />
                <div className="absolute top-0 bottom-0 right-0 w-24 md:w-64 z-10 bg-gradient-to-l from-white to-transparent pointer-events-none" />
                
                <motion.div
                    className="flex items-center gap-12 md:gap-20 whitespace-nowrap px-8"
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
                            aria-hidden={index >= partners.length}
                            className="flex items-center justify-center min-w-max hover:scale-105 transition-transform duration-300"
                        >
                            <div className="w-40 h-16 md:w-48 md:h-20 bg-white border border-slate-100 shadow-sm rounded-xl flex items-center justify-center px-4 overflow-hidden">
                                {client.logoUrl ? (
                                    <img src={client.logoUrl} alt={client.name} className="max-w-full max-h-full object-contain" />
                                ) : (
                                    <span className="text-slate-800 text-sm md:text-base font-bold text-center leading-snug">{client.name}</span>
                                )}
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
