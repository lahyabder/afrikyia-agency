"use client";

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Play, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useWorks, localize, normalizeLink, type WorkCategory, type WorkItem } from '@/lib/useWorks';

const INITIAL_COUNT = 6;
const CATEGORY_ORDER: WorkCategory[] = ['websites', 'works', 'activities', 'projects'];

function youtubeEmbed(url: string): string | null {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : null;
}

const Works = () => {
    const { t, isRTL, language } = useLanguage();
    const w = t.home.works;
    const works = useWorks();
    const [filter, setFilter] = useState<WorkCategory | 'all'>('all');
    const [expanded, setExpanded] = useState(false);
    const [activeVideo, setActiveVideo] = useState<string | null>(null);
    const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());

    const Arrow = isRTL ? ArrowLeft : ArrowRight;
    const items = works ?? [];
    const categories = CATEGORY_ORDER.filter(c => items.some(item => item.category === c));
    const filtered = filter === 'all' ? items : items.filter(item => item.category === filter);
    const visible = expanded ? filtered : filtered.slice(0, INITIAL_COUNT);

    const renderMedia = (item: WorkItem, title: string) => {
        const embed = item.video ? youtubeEmbed(item.video) : null;
        if (item.video && !embed) {
            return <video src={item.video} controls preload="metadata" className="w-full h-full object-cover bg-black" />;
        }
        return (
            <>
                {item.image && !brokenImages.has(item.id) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={item.image}
                        alt={title}
                        loading="lazy"
                        onError={() => setBrokenImages(prev => new Set(prev).add(item.id))}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-tint to-ground">
                        <span className="text-brand-red/80 text-2xl font-bold px-6 text-center line-clamp-2">{title}</span>
                    </div>
                )}
                {embed && (
                    <button
                        onClick={() => setActiveVideo(embed)}
                        className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors"
                        aria-label={w.watch}
                    >
                        <span className="w-14 h-14 rounded-full bg-white/95 text-brand-red flex items-center justify-center shadow-lg">
                            <Play className="w-6 h-6 fill-current ms-0.5" />
                        </span>
                    </button>
                )}
            </>
        );
    };

    if (works && items.length === 0) return null;

    return (
        <section id="works" className="site-section bg-white scroll-mt-16 lg:scroll-mt-[88px]">
            {/* Older links pointed to these sections */}
            <span id="achievements" className="sr-only" />
            <span id="projects" className="sr-only" />
            <div className="site-container">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                    <div className="max-w-2xl">
                        <p className="text-brand-red text-sm font-bold">{w.tag}</p>
                        <h2 className="mt-4 text-ink text-3xl lg:text-5xl font-bold leading-tight">{w.title}</h2>
                        <p className="mt-4 text-muted text-base lg:text-lg leading-relaxed">{w.desc}</p>
                    </div>
                    {categories.length > 1 && (
                        <div className="flex gap-2 overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0 pb-1">
                            {(['all', ...categories] as const).map(c => (
                                <button
                                    key={c}
                                    onClick={() => {
                                        setFilter(c);
                                        setExpanded(false);
                                    }}
                                    className={`shrink-0 h-10 px-5 rounded-full text-sm font-bold border transition-colors ${
                                        filter === c ? 'bg-ink text-white border-ink' : 'bg-white text-muted border-line hover:border-ink hover:text-ink'
                                    }`}
                                >
                                    {w[c]}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-10 lg:mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
                    {!works &&
                        [0, 1, 2].map(i => <div key={i} className="h-[380px] rounded-2xl bg-ground border border-line animate-pulse" />)}
                    {visible.map(item => {
                        const text = localize(item, language);
                        const link = normalizeLink(item.link);
                        return (
                            <article key={item.id} className="group flex flex-col rounded-2xl border border-line bg-white overflow-hidden hover:shadow-[0_12px_32px_rgba(20,22,26,0.08)] transition-shadow">
                                <div className="relative h-[200px] lg:h-[220px] overflow-hidden bg-ground">{renderMedia(item, text.title)}</div>
                                <div className="flex-1 flex flex-col p-6">
                                    <span className="self-start rounded-md bg-red-tint text-brand-red text-xs font-bold px-2.5 py-1">
                                        {text.categoryLabel || w[item.category]}
                                    </span>
                                    <h3 className="mt-3 text-ink text-lg font-bold leading-snug">{text.title}</h3>
                                    {text.desc && <p className="mt-2 text-muted text-[15px] leading-relaxed line-clamp-3">{text.desc}</p>}
                                    {link && (
                                        <a
                                            href={link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-auto pt-5 inline-flex items-center gap-2 text-sm font-bold text-ink hover:text-brand-red transition-colors self-start"
                                        >
                                            {w.visit}
                                            <Arrow className="w-4 h-4" />
                                        </a>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>

                {filtered.length > INITIAL_COUNT && (
                    <div className="mt-10 flex justify-center">
                        <button
                            onClick={() => setExpanded(e => !e)}
                            className="h-12 px-8 rounded-lg border border-line bg-white text-ink font-bold hover:border-ink transition-colors"
                        >
                            {expanded ? w.showLess : `${w.showAll} (${filtered.length})`}
                        </button>
                    </div>
                )}
            </div>

            {activeVideo && (
                <div
                    className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
                    onClick={() => setActiveVideo(null)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="relative w-full max-w-5xl aspect-video" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute -top-12 end-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
                            aria-label={w.close}
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <iframe
                            src={activeVideo}
                            className="w-full h-full rounded-xl"
                            allow="autoplay; encrypted-media; picture-in-picture"
                            allowFullScreen
                            title={w.watch}
                        />
                    </div>
                </div>
            )}
        </section>
    );
};

export default Works;
