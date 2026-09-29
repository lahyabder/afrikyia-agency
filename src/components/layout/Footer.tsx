"use client";

import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';
import { MapPin } from 'lucide-react';

const Footer = () => {
    const { t } = useLanguage();
    const nav = t.home.nav;

    const links = [
        { href: '/#about', label: nav.about },
        { href: '/#services', label: nav.services },
        { href: '/#works', label: nav.works },
        { href: '/#contact', label: nav.contact },
    ];

    return (
        <footer className="bg-night border-t border-white/10 text-[#A3A9B3]">
            <div className="site-container py-10 lg:py-12 grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div>
                    {/* The logo file is dark; on this background the name is written out */}
                    <Link href="/" className="text-2xl font-extrabold tracking-tight font-sans" dir="ltr" aria-label="Afrikyia">
                        <span className="text-white">afriky</span>
                        <span className="text-brand-red">ia</span>
                    </Link>
                    <p className="mt-2 text-sm">{t.footer.motto}</p>
                </div>

                <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold lg:justify-center">
                    {links.map(link => (
                        <Link key={link.href} href={link.href} className="text-[#C9CED6] hover:text-white transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <p className="flex items-start gap-2 text-xs leading-relaxed max-w-sm">
                    <MapPin className="w-4 h-4 shrink-0 text-[#FB7185]" />
                    <span>{t.footer.address}</span>
                </p>
            </div>

            <div className="border-t border-white/10">
                <div className="site-container py-5 flex flex-col sm:flex-row gap-3 justify-between text-xs">
                    <span>{t.footer.rights}</span>
                    <span className="flex gap-6">
                        <Link href="/privacy" className="hover:text-white transition-colors">{t.footer.privacy}</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">{t.footer.terms}</Link>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
