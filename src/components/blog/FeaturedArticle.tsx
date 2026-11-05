"use client";

import React from 'react';
import { Link } from '@/i18n/routing';
import {
    Sparkles,
    Clock,
    ArrowLeft,
    ArrowRight,
    Tag,
} from 'lucide-react';
import {
    type BlogPost,
    type Locale,
    CATEGORY_DEFINITIONS,
} from '@/data/blog';

interface Props {
    article: BlogPost;
    locale?: Locale;
}

export default function FeaturedArticle({ article, locale = 'ar' }: Props) {
    const isRTL = locale === 'ar';
    const title = article.title[locale] || article.title.ar;
    const excerpt = article.excerpt[locale] || article.excerpt.ar;
    const readTime = article.readTime[locale] || article.readTime.ar;
    const catDef = CATEGORY_DEFINITIONS[article.category];
    const catName = catDef.names[locale] || catDef.names.ar;

    const featuredBadge = isRTL
        ? 'مقال مميز'
        : locale === 'fr'
        ? 'Article à la une'
        : 'Featured Article';

    const readMoreText = isRTL
        ? 'قراءة التحليل كاملاً'
        : locale === 'fr'
        ? 'Lire l’analyse complète'
        : 'Read full analysis';

    return (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-10 lg:p-12 shadow-sm hover:shadow-xl transition-all duration-300 group">
            {/* Background subtle decoration */}
            <div className={`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br ${article.coverGradient} opacity-5 blur-3xl pointer-events-none`} />

            <div className="relative z-10 grid lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                    {/* Top Badges */}
                    <div className="flex items-center gap-2.5 flex-wrap mb-4">
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shadow-2xs">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                            <span>{featuredBadge}</span>
                        </span>

                        <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${catDef.bgColor} ${catDef.color} border ${catDef.borderColor}`}
                        >
                            <span>{catName}</span>
                        </span>

                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium ms-auto">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{readTime}</span>
                        </span>
                    </div>

                    {/* Headline */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight group-hover:text-brand-red transition-colors mb-4">
                        <Link href={`/blog/${article.slug}`}>
                            {title}
                        </Link>
                    </h2>

                    {/* Excerpt */}
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-6 font-normal">
                        {excerpt}
                    </p>

                    {/* Tags */}
                    {article.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap mb-8">
                            {article.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 border border-slate-200/60"
                                >
                                    <Tag className="w-3 h-3 text-slate-400" />
                                    <span>{tag}</span>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Author & CTA Button */}
                    <div className="flex items-center justify-between gap-4 flex-wrap pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                                AF
                            </div>
                            <div>
                                <span className="block text-sm font-bold text-slate-900">
                                    {article.author.name}
                                </span>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span>{article.author.role}</span>
                                    <span>•</span>
                                    <time dateTime={article.publishedAt}>
                                        {article.publishedAt}
                                    </time>
                                </div>
                            </div>
                        </div>

                        <Link
                            href={`/blog/${article.slug}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-brand-red text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                            <span>{readMoreText}</span>
                            {isRTL ? (
                                <ArrowLeft className="w-4 h-4" />
                            ) : (
                                <ArrowRight className="w-4 h-4" />
                            )}
                        </Link>
                    </div>
                </div>

                {/* Right Visual Accent Card */}
                <div className="lg:col-span-4 hidden lg:block">
                    <div className={`aspect-4/3 rounded-2xl bg-gradient-to-br ${article.coverGradient} p-8 flex flex-col justify-between text-white shadow-lg relative overflow-hidden`}>
                        <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                            <span className="text-xs uppercase tracking-widest text-white/70 font-mono block mb-1">
                                AFRIKYIA INSIGHTS
                            </span>
                            <span className="text-xl font-bold block leading-snug">
                                {catName}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

