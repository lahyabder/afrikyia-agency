"use client";

import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Globe, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
    const { t, isRTL } = useLanguage();

    return (
        <footer className="bg-black border-t border-white/10 py-20 text-white">
            <div className="container mx-auto px-6">
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                        <Image
                            src="/logo.png"
                            alt="Afrikyia"
                            width={160}
                            height={40}
                            className={`mb-8 ${isRTL ? 'mr-0' : 'ml-0'}`}
                            style={{ filter: 'invert(1) hue-rotate(180deg) saturate(20)', mixBlendMode: 'screen' }}
                        />
                        <p className="text-white/80 max-w-sm font-light">
                            {t.footer.motto}
                        </p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <a
                            href="mailto:contact@afrikyia.com"
                            className="flex items-center gap-4 text-2xl font-medium hover:text-brand-red transition-colors"
                        >
                            <Mail className="w-6 h-6 text-brand-red" />
                            contact@afrikyia.com
                        </a>
                        <div className={`flex gap-6 mt-4 ${isRTL ? 'justify-end' : ''}`}>
                            <Linkedin className="w-5 h-5 text-white/60 hover:text-brand-red cursor-pointer transition-colors" />
                            <Twitter className="w-5 h-5 text-white/60 hover:text-brand-red cursor-pointer transition-colors" />
                            <Instagram className="w-5 h-5 text-white/60 hover:text-brand-red cursor-pointer transition-colors" />
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 text-xs text-white/60 uppercase tracking-[0.2em] ${isRTL ? 'flex-row-reverse' : ''}`}>
                    <div>{t.footer.rights}</div>
                    <div className="mt-4 md:mt-0 flex gap-8">
                        <Link href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
