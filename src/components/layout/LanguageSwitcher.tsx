"use client";

import { useLanguage } from '@/context/LanguageContext';
import { useRouter, usePathname } from '@/i18n/routing';

const langs = [
    { code: 'ar', label: 'AR', name: 'العربية' },
    { code: 'fr', label: 'FR', name: 'Français' },
    { code: 'en', label: 'EN', name: 'English' },
] as const;

const LanguageSwitcher = () => {
    const { language } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();

    return (
        <div className="flex items-center text-[13px] font-bold" dir="ltr">
            {langs.map((lang, i) => (
                <span key={lang.code} className="flex items-center">
                    {i > 0 && <span className="px-1 text-line select-none" aria-hidden="true">·</span>}
                    <button
                        onClick={() => router.replace(pathname, { locale: lang.code })}
                        className={`px-1 py-1 transition-colors ${language === lang.code ? 'text-brand-red' : 'text-muted-2 hover:text-ink'}`}
                        aria-label={lang.name}
                        aria-current={language === lang.code ? 'true' : undefined}
                        lang={lang.code}
                    >
                        {lang.label}
                    </button>
                </span>
            ))}
        </div>
    );
};

export default LanguageSwitcher;
