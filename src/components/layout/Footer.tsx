"use client";

import { useLanguage } from '@/context/LanguageContext';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Phone, MapPin, Facebook } from 'lucide-react';
import { TiktokIcon } from '@/components/icons/TiktokIcon';

const Footer = () => {
    const { t, isRTL } = useLanguage();

    return (
        <footer className="bg-[#F8FAFC] relative border-t border-slate-200 py-8 md:py-12 overflow-hidden">
            <div className="container mx-auto px-6 relative z-10">
                <div className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-8 md:gap-10 mb-8 md:mb-12 ${isRTL ? 'text-right' : 'text-left'}`}>
                    <div>
                        <Image
                            src="/logo.png"
                            alt="Afrikyia"
                            width={120}
                            height={30}
                            className={`mb-4 ${isRTL ? 'mr-0' : 'ml-0'}`}
                        />
                        <p className="text-slate-500 max-w-sm font-light text-xs md:text-sm">
                            {t.footer.motto}
                        </p>
                    </div>

                    <div className="flex flex-col gap-3">
                        <a
                            href="mailto:contact@afrikyia.com"
                            className="flex items-center gap-3 text-sm md:text-base font-medium text-slate-700 hover:text-brand-red transition-colors"
                        >
                            <Mail className="w-4 h-4 text-brand-red flex-shrink-0" />
                            <span dir="ltr">contact@afrikyia.com</span>
                        </a>
                        <a
                            href="tel:+22224232202"
                            className="flex items-center gap-3 text-sm md:text-base font-medium text-slate-700 hover:text-brand-red transition-colors"
                        >
                            <Phone className="w-4 h-4 text-brand-red flex-shrink-0" />
                            <span dir="ltr">+222 24 23 22 02</span>
                        </a>

                        <div className="flex items-start gap-3 text-xs font-light text-slate-500 max-w-xs leading-relaxed mt-1">
                            <MapPin className="w-4 h-4 text-brand-red flex-shrink-0 mt-0.5" />
                            <span>{t.footer.address}</span>
                        </div>

                        <div className="mt-2 flex items-center gap-3">
                            <a href="https://www.facebook.com/profile.php?id=61594179056891" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-brand-red hover:text-white transition-all shadow-sm">
                                <Facebook className="w-4 h-4" />
                            </a>
                            <a href="https://www.tiktok.com/@afrikyiadeveloper" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-brand-red hover:text-white transition-all shadow-sm">
                                <TiktokIcon className="w-4 h-4" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className={`flex flex-col md:flex-row justify-between items-center pt-6 border-t border-slate-200 text-[10px] md:text-xs text-slate-400 uppercase tracking-[0.2em] ${isRTL ? 'flex-row-reverse' : ''}`}>
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
