"use client";

import React from 'react';
import {
    BLOG_CATEGORIES,
    type BlogCategory,
    CATEGORY_DEFINITIONS,
    type Locale,
} from '@/data/blog';

interface Props {
    selectedCategory: BlogCategory | 'all';
    onSelectCategory: (category: BlogCategory | 'all') => void;
    categoryCounts: Record<BlogCategory | 'all', number>;
    locale?: Locale;
}

export default function CategoryFilter({
    selectedCategory,
    onSelectCategory,
    categoryCounts,
    locale = 'ar',
}: Props) {
    const isRTL = locale === 'ar';

    const allLabel = isRTL
        ? 'جميع المقالات'
        : locale === 'fr'
        ? 'Tous les articles'
        : 'All Articles';

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
            {/* All Categories Button */}
            <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                    selectedCategory === 'all'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                }`}
            >
                <span>{allLabel}</span>
                <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono ${
                        selectedCategory === 'all'
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >
                    {categoryCounts.all}
                </span>
            </button>

            {/* Individual Category Buttons */}
            {BLOG_CATEGORIES.map(cat => {
                const def = CATEGORY_DEFINITIONS[cat];
                const isSelected = selectedCategory === cat;
                const name = def.names[locale] || def.names.ar;
                const count = categoryCounts[cat] || 0;

                return (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => onSelectCategory(cat)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer ${
                            isSelected
                                ? 'bg-brand-red text-white shadow-xs shadow-brand-red/20'
                                : 'bg-white border border-slate-200/80 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                    >
                        <span>{name}</span>
                        <span
                            className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono ${
                                isSelected
                                    ? 'bg-white/20 text-white'
                                    : 'bg-slate-100 text-slate-600'
                            }`}
                        >
                            {count}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}

