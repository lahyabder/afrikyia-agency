"use client";

import { useLocale, useMessages } from 'next-intl';

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
};

export const useLanguage = () => {
    const locale = useLocale();
    const messages = useMessages() as any;

    return {
        language: locale as 'en' | 'fr' | 'ar',
        setLanguage: (lang: string) => {},
        t: messages,
        isRTL: locale === 'ar'
    };
};
