"use client";

import { useLanguage } from '@/context/LanguageContext';
import { useSiteContent } from '@/lib/useSiteContent';
import achievements from '@/data/achievements.json';

type Partner = { id: string; name: string; logoUrl?: string };

// Until partners are managed in the admin panel, list the clients of past works.
const defaultPartners: Partner[] = Array.from(new Set(achievements.map(a => a.client)))
    .filter(Boolean)
    .map((name, i) => ({ id: String(i), name: name as string, logoUrl: '' }));

const TrustedBy = () => {
    const { t } = useLanguage();
    const { content, saved } = useSiteContent('trusted', { tag: t.home.partners.tag, title: t.trusted.title });
    const partners: Partner[] = Array.isArray(saved?.partners) ? saved.partners : defaultPartners;

    if (partners.length === 0) return null;

    return (
        <section id="partners" className="bg-white border-t border-line py-12 lg:py-16 scroll-mt-16 lg:scroll-mt-[88px]">
            <div className="site-container flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-14">
                <div className="shrink-0 lg:w-56">
                    <p className="text-brand-red text-sm font-bold">{content.tag}</p>
                    <h2 className="mt-2 text-ink text-xl font-bold">{content.title}</h2>
                </div>
                <ul className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {partners.map(p => (
                        <li
                            key={p.id}
                            className="h-20 rounded-xl border border-line bg-ground flex items-center justify-center px-4 text-center"
                            title={p.name}
                        >
                            {p.logoUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={p.logoUrl} alt={p.name} loading="lazy" className="max-h-12 max-w-full object-contain" />
                            ) : (
                                <span className="text-ink text-sm font-bold leading-snug line-clamp-2">{p.name}</span>
                            )}
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
};

export default TrustedBy;
