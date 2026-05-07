"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Globe, Activity, Code2 } from 'lucide-react';
import initialAchievements from '@/data/achievements.json';

type AchievementItem = {
    id: string;
    category: 'websites' | 'activities' | 'works';
    link: string;
    image?: string;
    en: { title: string; categoryLabel: string; desc: string };
    fr: { title: string; categoryLabel: string; desc: string };
    ar: { title: string; categoryLabel: string; desc: string };
};

const Achievements = () => {
    const { language, t, isRTL } = useLanguage();
    const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements as AchievementItem[]);
    const [activeFilter, setActiveFilter] = useState<'all' | 'websites' | 'activities' | 'works'>('all');

    // Fetch achievements on client mount
    useEffect(() => {
        const fetchAchievements = async () => {
            const hasLocalModifications = localStorage.getItem('afrikyia-achievements-modified') === 'true';

            // Check localStorage first
            const localCached = localStorage.getItem('afrikyia-achievements');
            if (localCached) {
                try {
                    setAchievements(JSON.parse(localCached));
                    if (hasLocalModifications) {
                        // Skip loading from API to keep the user's custom edits intact
                        return;
                    }
                } catch (e) {
                    // Ignore parsing error
                }
            }

            try {
                const response = await fetch('/api/achievements');
                if (response.ok) {
                    const data = await response.json();
                    if (Array.isArray(data) && data.length > 0) {
                        setAchievements(data);
                        localStorage.setItem('afrikyia-achievements', JSON.stringify(data));
                    }
                }
            } catch (err) {
                console.error("Failed to fetch achievements from API:", err);
            }
        };

        fetchAchievements();

        // Listen for admin changes (custom event)
        const handleAdminUpdate = () => {
            const localCached = localStorage.getItem('afrikyia-achievements');
            if (localCached) {
                setAchievements(JSON.parse(localCached));
            }
        };

        window.addEventListener('afrikyia-achievements-updated', handleAdminUpdate);
        return () => window.removeEventListener('afrikyia-achievements-updated', handleAdminUpdate);
    }, []);

    // Filter items based on activeFilter
    const filteredList = activeFilter === 'all' 
        ? achievements 
        : achievements.filter(item => item.category === activeFilter);

    // Categories filter options
    const filterOptions = [
        { key: 'all' as const, label: t.achievements.filters.all },
        { key: 'websites' as const, label: t.achievements.filters.websites },
        { key: 'activities' as const, label: t.achievements.filters.activities },
        { key: 'works' as const, label: t.achievements.filters.works },
    ];

    // Get corresponding icon for the category
    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'websites':
                return <Globe className="w-4 h-4" />;
            case 'activities':
                return <Activity className="w-4 h-4" />;
            default:
                return <Code2 className="w-4 h-4" />;
        }
    };

    return (
        <section id="achievements" className="py-24 md:py-40 bg-black border-t border-white/5">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className={`mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                        <h2 className="text-brand-red text-sm font-bold uppercase tracking-[0.4em] mb-4">
                            {t.achievements.tag}
                        </h2>
                        <h3 className="text-white text-4xl md:text-6xl font-bold tracking-tight">
                            {t.achievements.title}
                        </h3>
                    </div>

                    {/* Filter buttons */}
                    <div className={`flex flex-wrap gap-3 mt-4 lg:mt-0 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                        {filterOptions.map((option) => (
                            <button
                                key={option.key}
                                onClick={() => setActiveFilter(option.key)}
                                className={`px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-widest transition-all duration-300 border cursor-pointer ${
                                    activeFilter === option.key
                                        ? 'bg-brand-red border-brand-red text-white shadow-lg shadow-brand-red/20'
                                        : 'bg-white/5 border-white/10 text-white/70 hover:text-white hover:border-white/30 hover:bg-white/10'
                                }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Achievements Cards Grid */}
                <motion.div 
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    <AnimatePresence mode="popLayout">
                        {filteredList.map((item, idx) => {
                            // Extract localized item properties safely
                            const localized = item[language] || item['en'] || { title: "", categoryLabel: "", desc: "" };
                            
                            return (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    transition={{ duration: 0.4 }}
                                    whileHover={{ y: -10 }}
                                    className={`group relative bg-white/5 p-8 md:p-10 rounded-2xl border border-white/10 hover:border-brand-red/50 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-2xl hover:shadow-brand-red/5 ${
                                        isRTL ? 'text-right' : 'text-left'
                                    }`}
                                >
                                    {/* Glowing red outline hover effect */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-brand-red/0 to-brand-red/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl pointer-events-none" />

                                    {item.image && (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-6 border border-white/5 bg-black/40">
                                            <img 
                                                src={item.image} 
                                                alt={localized.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />
                                        </div>
                                    )}

                                    <div>
                                        {/* Card Header Tag */}
                                        <div className={`flex items-center gap-2 mb-6 ${isRTL ? 'flex-row-reverse justify-start' : 'justify-start'}`}>
                                            <span className="text-brand-red bg-brand-red/10 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                {getCategoryIcon(item.category)}
                                                {localized.categoryLabel}
                                            </span>
                                        </div>

                                        {/* Card Title */}
                                        <h4 className="text-white text-2xl font-bold mb-4 group-hover:text-brand-red transition-colors duration-300">
                                            {localized.title}
                                        </h4>

                                        {/* Card Description */}
                                        <p className="text-white/60 text-sm leading-relaxed mb-8">
                                            {localized.desc}
                                        </p>
                                    </div>

                                    {/* Link action if link is provided */}
                                    {item.link && item.link !== '#' ? (
                                        <a
                                            href={item.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/85 group-hover:text-brand-red transition-all duration-300 ${
                                                isRTL ? 'flex-row-reverse self-end' : 'self-start'
                                            }`}
                                        >
                                            <span>{isRTL ? 'زيارة الموقع' : 'Visit Project'}</span>
                                            <ExternalLink className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                                        </a>
                                    ) : (
                                        <span className={`inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/30 ${
                                            isRTL ? 'flex-row-reverse self-end' : 'self-start'
                                        }`}>
                                            <span>{isRTL ? 'عمل منجز' : 'Completed Work'}</span>
                                            <span className="w-1.5 h-1.5 rounded-full bg-brand-red/50" />
                                        </span>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </motion.div>
            </div>
        </section>
    );
};

export default Achievements;
