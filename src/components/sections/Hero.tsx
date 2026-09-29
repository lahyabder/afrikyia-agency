"use client";

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useLanguage } from '@/context/LanguageContext';
import { fetchSiteContent } from '@/lib/siteContent';
import { useWorks, localize } from '@/lib/useWorks';

const Hero = () => {
    const { t, isRTL, language } = useLanguage();
    const h = t.home;
    const works = useWorks();
    const [servicesCount, setServicesCount] = useState<number>(t.services.list.length);

    useEffect(() => {
        fetchSiteContent('services').then(data => {
            const list = data?.[language]?.list;
            if (Array.isArray(list)) setServicesCount(list.length);
        });
    }, [language]);

    const tiles = (works ?? []).filter(w => w.image).slice(0, 4);
    const Arrow = isRTL ? ArrowLeft : ArrowRight;

    const stats = [
        { value: works ? String(works.length) : '—', label: h.stats.works },
        { value: String(servicesCount), label: h.stats.services },
        { value: '3', label: h.stats.languages },
        { value: '2025', label: h.stats.founded },
    ];

    return (
        <section className="bg-ground pt-16 lg:pt-[88px]">
            <div className="site-container grid lg:grid-cols-2 gap-12 lg:gap-20 items-center py-14 lg:py-24">
                <div>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white border border-line px-4 py-1.5 text-[13px] font-bold text-muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        {h.hero.tag}
                    </span>
                    <h1 className="mt-6 text-ink font-bold tracking-tight leading-[1.1] text-[44px] sm:text-6xl xl:text-[76px]">
                        {t.hero.slogan}
                    </h1>
                    <p className="mt-6 max-w-xl text-lg lg:text-xl leading-relaxed text-muted">{t.hero.desc}</p>
                    <div className="mt-9 flex flex-wrap gap-3">
                        <Link
                            href="/#contact"
                            className="inline-flex items-center gap-2 h-12 lg:h-14 px-7 rounded-lg bg-brand-red hover:bg-red-dark text-white font-bold transition-colors"
                        >
                            {h.hero.primary}
                            <Arrow className="w-4 h-4" />
                        </Link>
                        <Link
                            href="/#works"
                            className="inline-flex items-center h-12 lg:h-14 px-7 rounded-lg bg-white border border-line hover:border-ink text-ink font-bold transition-colors"
                        >
                            {h.hero.secondary}
                        </Link>
                    </div>
                </div>

                {/* Four recent works, staggered */}
                <div className="grid grid-cols-2 gap-3 lg:gap-5">
                    {[0, 1, 2, 3].map(i => {
                        const item = tiles[i];
                        const offset = i % 2 === 1 ? 'translate-y-6 lg:translate-y-10' : '';
                        if (!item) {
                            return (
                                <div
                                    key={i}
                                    className={`aspect-[4/3] rounded-xl ${works ? 'bg-white border border-line' : 'bg-line/60 animate-pulse'} ${offset}`}
                                />
                            );
                        }
                        const title = localize(item, language).title;
                        return (
                            <Link
                                key={item.id}
                                href="/#works"
                                className={`group relative aspect-[4/3] rounded-xl overflow-hidden bg-white border border-line shadow-[0_8px_24px_rgba(20,22,26,0.08)] ${offset}`}
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={item.image}
                                    alt={title}
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-8 text-white text-xs lg:text-sm font-bold truncate">
                                    {title}
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Figures */}
            <div className="border-t border-line bg-white">
                <div className="site-container grid grid-cols-2 lg:grid-cols-4">
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            className={`py-6 lg:py-8 px-4 lg:px-8 ${i === 0 ? 'ps-0 lg:ps-0' : ''} ${i === 2 ? 'ps-0 lg:ps-8' : ''} ${i % 2 === 1 ? 'border-s border-line' : ''} ${i >= 2 ? 'border-t lg:border-t-0 border-line' : ''} ${i === 2 ? 'lg:border-s' : ''}`}
                        >
                            <div className="text-3xl lg:text-4xl font-bold text-ink">{s.value}</div>
                            <div className="mt-1 text-sm text-muted-2">{s.label}</div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Hero;
