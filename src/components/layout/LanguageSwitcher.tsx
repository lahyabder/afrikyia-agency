"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Globe, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname } from '@/i18n/routing';

const LanguageSwitcher = () => {
    const { language } = useLanguage();
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const langs = [
        { code: 'en', label: 'English' },
        { code: 'fr', label: 'Français' },
        { code: 'ar', label: 'العربية' }
    ];

    const currentLang = langs.find(l => l.code === language);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-slate-700 hover:text-brand-red transition-colors text-xs uppercase tracking-widest font-semibold group focus:outline-none"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <Globe className="w-4 h-4" />
                <span>{currentLang?.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full mt-4 right-0 min-w-[140px] bg-white border border-slate-200 rounded-xl overflow-hidden z-50 shadow-xl">
                    {langs.map((lang) => (
                        <button
                            key={lang.code}
                            onClick={() => {
                                router.replace(pathname, { locale: lang.code });
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-5 py-3 text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors ${
                                language === lang.code ? 'text-brand-red font-bold' : 'text-slate-700 font-semibold'
                            }`}
                            role="option"
                            aria-selected={language === lang.code}
                        >
                            {lang.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LanguageSwitcher;
