"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const LanguageSwitcher = () => {
    const { language, setLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    const langs = [
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' },
        { code: 'ar', label: 'العربية' }
    ];

    const currentLang = langs.find(l => l.code === language);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-white/90 hover:text-brand-red transition-colors text-xs uppercase tracking-widest font-medium group"
            >
                <Globe className="w-4 h-4" />
                <span>{currentLang?.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute top-full mt-4 right-0 md:left-auto min-w-[140px] bg-black border border-white/20 rounded-xl overflow-hidden z-20 shadow-2xl"
                        >
                            {langs.map((lang) => (
                                <button
                                    key={lang.code}
                                    onClick={() => {
                                        setLanguage(lang.code as any);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest hover:bg-white/10 transition-colors ${language === lang.code ? 'text-brand-red font-bold' : 'text-white/90'
                                        }`}
                                >
                                    {lang.label}
                                </button>
                            ))}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default LanguageSwitcher;
