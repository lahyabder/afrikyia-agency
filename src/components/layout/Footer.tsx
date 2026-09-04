"use client";

import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
    const { t, isRTL } = useLanguage();

    return (
        <footer className="bg-[#F8FAFC] relative border-t border-slate-200 py-12 md:py-16 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-10 mb-12 md:mb-16 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                        <Image
                            src="/logo.png"
                            alt="Afrikyia"
                            width={140}
                            height={35}
                            className={`mb-6 ${isRTL ? 'mr-0' : 'ml-0'}`}
                        />
                        <p className="text-slate-600 max-w-sm font-light text-sm md:text-base">
                            {t.footer.motto}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        <a
                            href="mailto:contact@afrikyia.com"
                            className="flex items-center gap-3 text-base md:text-lg font-medium text-slate-900 hover:text-brand-red transition-colors"
                        >
                            <Mail className="w-4 h-4 md:w-5 md:h-5 text-brand-red flex-shrink-0" />
                            contact@afrikyia.com
                        </a>
                        <a
                            href="tel:+22224232202"
                            className="flex items-center gap-3 text-base md:text-lg font-medium text-slate-900 hover:text-brand-red transition-colors"
                            dir="ltr"
                        >
                            <Phone className="w-4 h-4 md:w-5 md:h-5 text-brand-red flex-shrink-0" />
                            +222 24 23 22 02
                        </a>

                        <div className="flex items-start gap-3 text-xs md:text-sm font-light text-slate-600 max-w-sm leading-relaxed mt-1">
                            <MapPin className="w-4 h-4 md:w-5 md:h-5 text-brand-red flex-shrink-0 mt-0.5" />
                            {t.footer.address}
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col md:flex-row justify-between items-center pt-6 md:pt-8 border-t border-slate-200 text-xs text-slate-500 uppercase tracking-[0.2em] ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>{t.footer.rights}</div>
                    <div className="mt-4 md:mt-0 flex gap-6">
                        <Link href="/privacy" className="hover:text-brand-red transition-colors">{t.footer.privacy}</Link>
                        <Link href="/terms" className="hover:text-brand-red transition-colors">{t.footer.terms}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
