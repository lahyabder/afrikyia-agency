"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, Globe, Activity, Code2, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
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
        <section id="achievements" className="py-16 md:py-24 bg-white border-t border-slate-200">
            <div className="container mx-auto px-6">
                {/* Header */}
                <div className={`mb-16 flex flex-col lg:flex-row lg:items-end justify-between gap-8 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                        <h2 className="text-slate-900 text-4xl md:text-6xl font-bold tracking-tight">
                            {t.achievements.title}
                        </h2>
                    </div>
                </div>

                {/* Achievements Cards Grid */}
                <motion.div
                    layout
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
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
                                    whileHover={{ y: -5 }}
                                    className="group relative bg-white p-6 md:p-8 rounded-2xl border border-slate-200 hover:border-brand-red/30 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl overflow-hidden text-start"
                                    dir={isRTL ? "rtl" : "ltr"}
                                >
                                    {item.image && (
                                        <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-6 border border-slate-100 bg-slate-50">
                                            <img
                                                src={item.image}
                                                alt={localized.title}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 via-transparent to-transparent pointer-events-none" />
                                        </div>
                                    )}

                                    <div className="flex-1 flex flex-col">
                                        {/* Project Title */}
                                        <h4 className="text-slate-900 text-2xl font-bold mb-3 group-hover:text-brand-red transition-colors duration-300">
                                            {localized.title}
                                        </h4>

                                        {/* Project Category */}
                                        <div className="flex items-center gap-2 mb-4 justify-start">
                                            <span className="text-brand-red bg-brand-red/10 px-3 py-1 rounded-lg text-xs font-bold uppercase flex items-center gap-1.5">
                                                {getCategoryIcon(item.category)}
                                                {localized.categoryLabel}
                                            </span>
                                        </div>

                                        {/* Project Description */}
                                        <p className="text-slate-600 text-sm leading-relaxed mb-8">
                                            {localized.desc}
                                        </p>
                                    </div>

                                    {/* Link action if link is provided */}
                                    {item.link && item.link !== '#' && (
                                        <Link
                                            href={`/works/${item.id}`}
                                            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 group-hover:text-brand-red transition-all duration-300 py-3 self-start"
                                        >
                                            <span>{isRTL ? 'عرض المشروع' : 'View Project'}</span>
                                            <ArrowRight className={`w-4 h-4 transition-transform duration-300 ${isRTL ? 'group-hover:-translate-x-1 rotate-180' : 'group-hover:translate-x-1'}`} />
                                        </Link>
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
