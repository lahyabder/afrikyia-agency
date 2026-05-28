"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '@/lib/translations';

type LanguageContextType = {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: typeof translations.en;
    isRTL: boolean;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        setTimeout(() => {
            const savedLang = localStorage.getItem('afrikyia-lang') as Language;
            if (savedLang && (savedLang === 'en' || savedLang === 'fr' || savedLang === 'ar')) {
                setLanguage(savedLang);
            }
        }, 0);
    }, []);

    useEffect(() => {
        localStorage.setItem('afrikyia-lang', language);
        document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = language;

        // Add or remove arabic-font class on body
        if (language === 'ar') {
            document.body.classList.add('arabic-font');
        } else {
            document.body.classList.remove('arabic-font');
        }
    }, [language]);

    const value = {
        language,
        setLanguage,
        t: translations[language],
        isRTL: language === 'ar'
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
