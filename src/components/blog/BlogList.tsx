"use client";

import React, { useState, useMemo } from 'react';
import { Search, X, AlertCircle } from 'lucide-react';
import {
    type BlogPost,
    type BlogCategory,
    type Locale,
    searchArticles,
} from '@/data/blog';
import CategoryFilter from './CategoryFilter';
import ArticleCard from './ArticleCard';
import FeaturedArticle from './FeaturedArticle';

interface Props {
    articles: BlogPost[];
    locale?: Locale;
}

export default function BlogList({ articles, locale = 'ar' }: Props) {
    const isRTL = locale === 'ar';
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<BlogCategory | 'all'>('all');

    // Category counts calculation
    const categoryCounts = useMemo(() => {
        const counts: Record<BlogCategory | 'all', number> = {
            all: articles.length,
            technology: 0,
            news: 0,
            studies: 0,
            discoveries: 0,
            knowledge: 0,
        };

        articles.forEach(a => {
            if (counts[a.category] !== undefined) {
                counts[a.category] += 1;
            }
        });

        return counts;
    }, [articles]);

    // Filtered articles list
    const filteredArticles = useMemo(() => {
        let result = articles;

        // 1. Filter by category
        if (selectedCategory !== 'all') {
            result = result.filter(a => a.category === selectedCategory);
        }

        // 2. Filter by search query
        if (searchQuery.trim()) {
            const searchedSlugs = new Set(
                searchArticles(searchQuery, locale).map(a => a.slug)
            );
            result = result.filter(a => searchedSlugs.has(a.slug));
        }

        return result;
    }, [articles, selectedCategory, searchQuery, locale]);

    // Find featured article (only shown when category === 'all' and no active search)
    const featuredArticle = useMemo(() => {
        if (selectedCategory !== 'all' || searchQuery.trim().length > 0) {
            return null;
        }
        return articles.find(a => a.featured) || articles[0];
    }, [articles, selectedCategory, searchQuery]);

    // Grid articles (exclude featured when featured is shown)
    const gridArticles = useMemo(() => {
        if (!featuredArticle) return filteredArticles;
        return filteredArticles.filter(a => a.slug !== featuredArticle.slug);
    }, [filteredArticles, featuredArticle]);

    const searchPlaceholder = isRTL
        ? 'ابحث في المقالات، المواضيع، والكلمات المفتاحية...'
        : locale === 'fr'
        ? 'Rechercher des articles, sujets ou mots-clés...'
        : 'Search articles, topics, and keywords...';

    const emptyTitle = isRTL
        ? 'لم يتم العثور على مقالات مطابقة'
        : locale === 'fr'
        ? 'Aucun article trouvé'
        : 'No matching articles found';

    const emptyDesc = isRTL
        ? 'جرب البحث بكلمات أخرى أو اختر فئة مختلفة من القائمة أعلاه.'
        : locale === 'fr'
        ? 'Essayez avec d’autres termes ou sélectionnez une autre catégorie.'
        : 'Try different search terms or select another category above.';

    const clearSearchText = isRTL
        ? 'إعادة ضبط البحث'
        : locale === 'fr'
        ? 'Réinitialiser la recherche'
        : 'Reset search';

    return (
        <div className="space-y-8 sm:space-y-10">
            {/* Search and Filters Toolbar */}
            <div className="space-y-5">
                {/* Search Bar */}
                <div className="relative max-w-2xl mx-auto">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-4 pointer-events-none text-slate-400">
                        <Search className="w-5 h-5" />
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={searchPlaceholder}
                        className="w-full bg-white border border-slate-200/90 rounded-2xl ps-12 pe-12 py-3.5 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-red focus:ring-4 focus:ring-brand-red/5 transition-all shadow-xs"
                    />
                    {searchQuery && (
                        <button
                            type="button"
                            onClick={() => setSearchQuery('')}
                            aria-label="مسح البحث"
                            className="absolute inset-y-0 end-0 flex items-center pe-4 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex justify-center">
                    <CategoryFilter
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        categoryCounts={categoryCounts}
                        locale={locale}
                    />
                </div>
            </div>

            {/* Featured Article Section (Only on All + No Search) */}
            {featuredArticle && (
                <div className="pt-2">
                    <FeaturedArticle article={featuredArticle} locale={locale} />
                </div>
            )}

            {/* Articles Grid or Empty State */}
            {filteredArticles.length === 0 ? (
                <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200/80 my-8">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{emptyTitle}</h3>
                    <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">{emptyDesc}</p>
                    <button
                        type="button"
                        onClick={() => {
                            setSearchQuery('');
                            setSelectedCategory('all');
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-red text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                        <span>{clearSearchText}</span>
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
                    {gridArticles.map(article => (
                        <ArticleCard key={article.slug} article={article} locale={locale} />
                    ))}
                </div>
            )}
        </div>
    );
}

