import { describe, it, expect } from 'vitest';
import {
    getAllArticles,
    getArticleBySlug,
    getArticlesByCategory,
    searchArticles,
    getRelatedArticles,
    getFeaturedArticles,
    getCategoryMetadata,
    BLOG_CATEGORIES,
    type BlogCategory,
} from './blog';

describe('Blog Data Model and Query Helpers', () => {
    it('contains all required categories requested by client', () => {
        expect(BLOG_CATEGORIES).toEqual(
            expect.arrayContaining(['technology', 'news', 'studies', 'discoveries', 'knowledge'])
        );
    });

    it('returns all articles with valid multilingual structures', () => {
        const articles = getAllArticles();
        expect(articles.length).toBeGreaterThanOrEqual(5);

        for (const article of articles) {
            expect(article.slug).toBeDefined();
            expect(typeof article.slug).toBe('string');
            expect(BLOG_CATEGORIES).toContain(article.category);
            expect(article.title.ar).toBeDefined();
            expect(article.title.en).toBeDefined();
            expect(article.title.fr).toBeDefined();
            expect(article.excerpt.ar).toBeDefined();
            expect(article.content.ar.length).toBeGreaterThan(0);
            expect(article.author.name).toBeDefined();
            expect(article.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
            expect(Array.isArray(article.tags)).toBe(true);
        }
    });

    it('retrieves an article by slug and returns undefined for invalid slug', () => {
        const all = getAllArticles();
        const first = all[0];
        const found = getArticleBySlug(first.slug);
        expect(found).toEqual(first);

        const notFound = getArticleBySlug('non-existent-article-slug-xyz');
        expect(notFound).toBeUndefined();
    });

    it('filters articles by category', () => {
        const techArticles = getArticlesByCategory('technology');
        expect(techArticles.length).toBeGreaterThan(0);
        techArticles.forEach(a => expect(a.category).toBe('technology'));

        const studiesArticles = getArticlesByCategory('studies');
        expect(studiesArticles.length).toBeGreaterThan(0);
        studiesArticles.forEach(a => expect(a.category).toBe('studies'));
    });

    it('searches articles by query in Arabic, English, and French', () => {
        const arResults = searchArticles('تكنولوجيا', 'ar');
        expect(arResults.length).toBeGreaterThan(0);

        const enResults = searchArticles('cloud', 'en');
        expect(enResults.length).toBeGreaterThan(0);

        const emptyResults = searchArticles('randomgibberish987654321', 'ar');
        expect(emptyResults).toEqual([]);
    });

    it('returns related articles excluding the target article itself', () => {
        const all = getAllArticles();
        const target = all[0];
        const related = getRelatedArticles(target.slug, 2);

        expect(related.length).toBeLessThanOrEqual(2);
        related.forEach(r => {
            expect(r.slug).not.toBe(target.slug);
        });
    });

    it('returns featured articles', () => {
        const featured = getFeaturedArticles();
        expect(featured.length).toBeGreaterThan(0);
        featured.forEach(a => expect(a.featured).toBe(true));
    });

    it('returns localized category metadata and badge styling', () => {
        const techMetaAr = getCategoryMetadata('technology', 'ar');
        expect(techMetaAr.name).toBe('تكنولوجيا');
        expect(techMetaAr.color).toBeDefined();
        expect(techMetaAr.bgColor).toBeDefined();

        const newsMetaFr = getCategoryMetadata('news', 'fr');
        expect(newsMetaFr.name).toBe('Actualités');
    });
});

