"use client";

import React from 'react';
import { Link } from '@/i18n/routing';
import {
    Clock,
    Calendar,
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

export default function ArticleCard({ article, locale = 'ar' }: Props) {
    const isRTL = locale === 'ar';
    const title = article.title[locale] || article.title.ar;
    const excerpt = article.excerpt[locale] || article.excerpt.ar;
    const readTime = article.readTime[locale] || article.readTime.ar;
    const catDef = CATEGORY_DEFINITIONS[article.category];
    const catName = catDef.names[locale] || catDef.names.ar;

    const readMoreText = isRTL
        ? 'اقرأ المقال'
        : locale === 'fr'
        ? 'Lire l’article'
        : 'Read article';

    return (
        <article className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden">
            {/* Top Banner Gradient Accent */}
            <div className={`h-2.5 w-full bg-gradient-to-r ${article.coverGradient}`} />

            <div className="p-6 sm:p-7 flex flex-col flex-1">
                {/* Meta Row: Category Badge & Read Time */}
                <div className="flex items-center justify-between gap-3 mb-4">
                    <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${catDef.bgColor} ${catDef.color} border ${catDef.borderColor}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                        <span>{catName}</span>
                    </span>

                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{readTime}</span>
                    </span>
                </div>

                {/* Title */}
                <h3 className="text-slate-900 text-lg sm:text-xl font-bold leading-snug group-hover:text-brand-red transition-colors mb-3">
                    <Link href={`/blog/${article.slug}`}>
                        {title}
                    </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-6 flex-1 font-normal">
                    {excerpt}
                </p>

                {/* Tags */}
                {article.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap mb-6">
                        {article.tags.slice(0, 3).map(tag => (
                            <span
                                key={tag}
                                className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-50 text-slate-500 border border-slate-200/60"
                            >
                                <Tag className="w-2.5 h-2.5 text-slate-400" />
                                <span>{tag}</span>
                            </span>
                        ))}
                    </div>
                )}

                {/* Footer Row: Author & Link */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 mt-auto">
                    <div className="min-w-0">
                        <span className="block text-xs font-bold text-slate-900 truncate">
                            {article.author.name}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <Calendar className="w-3 h-3 shrink-0" />
                            <time dateTime={article.publishedAt}>
                                {article.publishedAt}
                            </time>
                        </div>
                    </div>

                    <Link
                        href={`/blog/${article.slug}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-red group-hover:translate-x-0.5 transition-transform shrink-0"
                    >
                        <span>{readMoreText}</span>
                        {isRTL ? (
                            <ArrowLeft className="w-3.5 h-3.5" />
                        ) : (
                            <ArrowRight className="w-3.5 h-3.5" />
                        )}
                    </Link>
                </div>
            </div>
        </article>
    );
}

