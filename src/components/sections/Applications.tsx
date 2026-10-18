"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface WindowWithAnalytics extends Window {
    gtag?: (command: string, eventName: string, eventParams: Record<string, string>) => void;
    dataLayer?: Array<Record<string, unknown>>;
}

type ApplicationItem = {
    id: 'diftar' | 'sanad' | 'elbet' | 'badila';
    name: string;
    latinName: string;
    domain: string;
    url: string;
    logo: string;
    accentColor: string;
};

const APPLICATIONS_CONFIG: ApplicationItem[] = [
    {
        id: 'diftar',
        name: 'دفتر',
        latinName: 'DIFTAR',
        domain: 'diftar.online',
        url: 'https://www.diftar.online/',
        logo: '/apps/diftar-logo.png',
        accentColor: '#00A69D',
    },
    {
        id: 'sanad',
        name: 'سند',
        latinName: 'SANAD',
        domain: 'sanadrim.com',
        url: 'https://sanadrim.com/',
        logo: '/apps/sanad-mark.png',
        accentColor: '#0E7A63',
    },
    {
        id: 'elbet',
        name: 'البت',
        latinName: 'ELBET',
        domain: 'elbet.art',
        url: 'https://www.elbet.art/',
        logo: '/apps/elbet-logo.png',
        accentColor: '#B45309',
    },
    {
        id: 'badila',
        name: 'بديلة',
        latinName: 'BADILA',
        domain: 'badila.online',
        url: 'https://www.badila.online/',
        logo: '/apps/badila-logo.png',
        accentColor: '#D4903A',
    },
];

export default function Applications() {
    const { t, isRTL } = useLanguage();

    const appSection = t?.applications || {};
    const appItems = appSection?.items || {};

    const trackAppClick = (appName: string, appUrl: string) => {
        if (typeof window !== 'undefined') {
            try {
                const win = window as unknown as WindowWithAnalytics;
                if (typeof win.gtag === 'function') {
                    win.gtag('event', 'application_click', {
                        app_name: appName,
                        app_url: appUrl,
                        page_location: window.location.href,
                    });
                } else if (Array.isArray(win.dataLayer)) {
                    win.dataLayer.push({
                        event: 'application_click',
                        app_name: appName,
                        app_url: appUrl,
                        page_location: window.location.href,
                    });
                }
            } catch {
                // Defensive: Ignore analytics errors
            }
        }
    };

    return (
        <section
            id="products"
            aria-labelledby="applications-heading"
            className="py-20 lg:py-28 bg-white border-t border-slate-200/80 relative overflow-hidden scroll-mt-16 lg:scroll-mt-24"
        >
            {/* Backward compatibility anchor */}
            <span id="applications" className="sr-only" aria-hidden="true" />
            <div className="site-container relative z-10">
                {/* Section Header */}
                <div className="max-w-3xl mb-14 lg:mb-20">
                    <div className="inline-flex items-center gap-2 rounded-full bg-slate-50 border border-slate-200/80 px-3.5 py-1 text-xs font-bold text-brand-red mb-4 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-red" />
                        <span>{appSection.tag || (isRTL ? 'منتجاتنا' : 'Nos produits')}</span>
                    </div>

                    <h2
                        id="applications-heading"
                        className="text-slate-900 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
                    >
                        {appSection.title || (isRTL ? 'منتجاتنا الرقمية' : 'Nos produits numériques')}
                    </h2>

                    <p className="mt-4 text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed font-normal">
                        {appSection.intro ||
                            (isRTL
                                ? 'نطور في AFRIKYIA حلولا رقمية عملية تستجيب لاحتياجات الأفراد والمهنيين والمؤسسات، وتجمع بين سهولة الاستخدام والابتكار.'
                                : "Chez AFRIKYIA, nous développons des solutions numériques pratiques adaptées aux besoins des particuliers, des professionnels et des organisations, alliant simplicité d'utilisation et innovation.")}
                    </p>
                </div>

                {/* Applications 4-Card Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 items-stretch">
                    {APPLICATIONS_CONFIG.map((app, idx) => {
                        const itemData = appItems[app.id] || {};
                        const displayName = itemData.name || app.name;
                        const displayLatinName = itemData.latinName || app.latinName;
                        const displayBadge = itemData.badge;
                        const displayDesc = itemData.desc;

                        return (
                            <motion.article
                                key={app.id}
                                initial={{ opacity: 0, y: 25 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "0px 0px -50px 0px", amount: 0.1 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                whileHover={{ y: -5 }}
                                className={`group bg-[#FAFCFF] p-7 md:p-8 rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${isRTL ? 'text-right' : 'text-left'}`}
                            >
                                {/* Top Accent Line */}
                                <div
                                    className="absolute top-0 inset-x-0 h-1 opacity-80 group-hover:opacity-100 transition-opacity"
                                    style={{ backgroundColor: app.accentColor }}
                                    aria-hidden="true"
                                />

                                {/* Card Header: Official Logo + Meta */}
                                <div>
                                    <div className="flex items-center justify-between gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-xl bg-white border border-slate-200/80 p-2.5 flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 group-hover:border-slate-300 transition-all duration-300">
                                            <Image
                                                src={app.logo}
                                                alt={`${displayName} Logo`}
                                                width={60}
                                                height={60}
                                                className="w-full h-full object-contain"
                                            />
                                        </div>

                                        <span className="text-[11px] font-semibold text-slate-500 bg-white border border-slate-200/70 px-2.5 py-1 rounded-full uppercase tracking-wider shrink-0">
                                            {appSection.pwa || (isRTL ? 'تطبيق ويب' : 'App Web')}
                                        </span>
                                    </div>

                                    {/* App Name & Latin Badge */}
                                    <div className="mb-4">
                                        <div className="flex items-baseline gap-2 flex-wrap">
                                            <h4 className="text-slate-900 text-2xl font-bold tracking-tight group-hover:text-brand-red transition-colors duration-200">
                                                {displayName}
                                            </h4>
                                            <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
                                                {displayLatinName}
                                            </span>
                                        </div>

                                        {displayBadge && (
                                            <p className="text-xs font-semibold text-slate-500 mt-1">
                                                {displayBadge}
                                            </p>
                                        )}
                                    </div>

                                    {/* Approved Concise Definition */}
                                    <p className="text-slate-600 text-sm leading-relaxed font-normal mb-6">
                                        {displayDesc}
                                    </p>
                                </div>

                                {/* Card Footer: Direct Open Button & Domain Indicator */}
                                <div className="pt-4 border-t border-slate-200/70 mt-auto">
                                    <a
                                        id={`btn-open-${app.id}`}
                                        href={app.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={() => trackAppClick(app.name, app.url)}
                                        aria-label={`${appSection.openApp || (isRTL ? 'فتح تطبيق' : 'Accéder à')} ${displayName}`}
                                        className="inline-flex items-center justify-between w-full px-4 py-3 rounded-xl bg-white hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-200 hover:border-slate-900 font-semibold text-sm transition-all duration-200 group/btn shadow-2xs"
                                    >
                                        <span>
                                            {appSection.openApp || (isRTL ? 'فتح التطبيق' : "Accéder à l'application")}
                                        </span>
                                        <ExternalLink
                                            className={`w-4 h-4 text-slate-400 group-hover/btn:text-white transition-all transform ${isRTL ? 'group-hover/btn:-translate-x-1' : 'group-hover/btn:translate-x-1'}`}
                                            aria-hidden="true"
                                        />
                                    </a>

                                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                                        <span className="inline-flex items-center gap-1.5 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                            {isRTL ? 'منصة نشطة' : 'Plateforme active'}
                                        </span>
                                        <span dir="ltr" className="font-mono text-[10.5px] text-slate-400">
                                            {app.domain}
                                        </span>
                                    </div>
                                </div>
                            </motion.article>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
