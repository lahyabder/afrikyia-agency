"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Link } from '@/i18n/routing';
import { MapPin } from 'lucide-react';
import Image from 'next/image';
import { DEFAULT_SOCIAL_ACCOUNTS, type SocialAccount } from '@/lib/socials';
import { getPlatformIcon } from '@/components/admin/SocialAccountsManager';

const Footer = () => {
    const { t } = useLanguage();
    const nav = t.home.nav;
    const [socials, setSocials] = useState<SocialAccount[]>(DEFAULT_SOCIAL_ACCOUNTS);

    useEffect(() => {
        fetch('/api/company/socials')
            .then(res => (res.ok ? res.json() : null))
            .then(data => {
                if (data?.socials && Array.isArray(data.socials) && data.socials.length > 0) {
                    setSocials(data.socials);
                }
            })
            .catch(() => {});
    }, []);

    const links = [
        { href: '/#solutions', label: nav.solutions || nav.services },
        { href: '/#products', label: nav.products || nav.applications },
        { href: '/#works', label: nav.works },
        { href: '/#methodology', label: nav.methodology || (nav.about ? 'منهجيتنا' : 'Méthode') },
        { href: '/#about', label: nav.about },
        { href: '/#contact', label: nav.contact },
    ];

    return (
        <footer className="bg-white border-t border-slate-200/80 text-slate-600">
            <div className="site-container py-12 lg:py-16 grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div>
                    <Link href="/" className="inline-block" aria-label="Afrikyia">
                        <Image
                            src="/logo.png"
                            alt="Afrikyia"
                            width={160}
                            height={45}
                            className="h-8 lg:h-9 w-auto"
                        />
                    </Link>
                    <p className="mt-3 text-sm text-slate-500 max-w-sm">{t.footer.motto}</p>
                    {socials.length > 0 && (
                        <div className="mt-4 flex items-center gap-2">
                            {socials.map(s => (
                                <a
                                    key={s.id || s.url}
                                    href={s.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={s.label || s.platform}
                                    className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200/80 text-slate-500 hover:text-brand-red hover:border-slate-300 flex items-center justify-center transition-colors"
                                >
                                    {getPlatformIcon(s.platform, 'w-3.5 h-3.5')}
                                </a>
                            ))}
                        </div>
                    )}
                </div>

                <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm font-bold lg:justify-center">
                    {links.map(link => (
                        <Link key={link.href} href={link.href} className="text-slate-600 hover:text-brand-red transition-colors">
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <p className="flex items-start gap-2.5 text-xs text-slate-500 leading-relaxed max-w-xs">
                    <MapPin className="w-4 h-4 shrink-0 text-brand-red mt-0.5" />
                    <span>{t.footer.address}</span>
                </p>
            </div>

            <div className="border-t border-slate-100 py-6">
                <div className="site-container flex flex-col sm:flex-row gap-3 justify-between text-xs text-slate-400">
                    <span>{t.footer.rights}</span>
                    <span className="flex gap-6 font-medium">
                        <Link href="/security" className="hover:text-slate-700 transition-colors">{t.footer.security || 'Sécurité & Confiance'}</Link>
                        <Link href="/privacy" className="hover:text-slate-700 transition-colors">{t.footer.privacy}</Link>
                        <Link href="/terms" className="hover:text-slate-700 transition-colors">{t.footer.terms}</Link>
                    </span>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
