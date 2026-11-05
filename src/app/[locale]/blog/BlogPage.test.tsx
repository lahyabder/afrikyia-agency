import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

const { mockPosts } = vi.hoisted(() => ({
    mockPosts: [
        {
            slug: 'cloud-native-architecture-africa',
            category: 'technology',
            title: { ar: 'هندسة النظم السحابية الموزعة', en: 'Cloud', fr: 'Cloud' },
            excerpt: { ar: 'ملخص تجريبي', en: 'Excerpt', fr: 'Extrait' },
            content: { ar: [{ body: ['محتوى'] }], en: [], fr: [] },
            author: { name: 'فريق الهندسة في AFRIKYIA', role: 'Dev' },
            publishedAt: '2026-11-04',
            readTime: { ar: '5 دقائق', en: '5 min', fr: '5 min' },
            tags: ['Cloud'],
            coverGradient: 'from-blue-600 to-indigo-900',
            isPublished: true,
        },
    ],
}));

vi.mock('@/lib/blogStore', () => ({
    loadBlogArticles: vi.fn().mockImplementation(() => Promise.resolve(mockPosts)),
}));

import BlogPage from './page';

// Mock Header & Footer
vi.mock('@/components/layout/Header', () => ({
    default: () => <header data-testid="mock-header">Header</header>,
}));
vi.mock('@/components/layout/Footer', () => ({
    default: () => <footer data-testid="mock-footer">Footer</footer>,
}));

// Mock routing Link
vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href, className }: any) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

describe('Blog Hub Page (/blog)', () => {
    it('renders the blog page hero with badge and description', async () => {
        const page = await BlogPage({ params: Promise.resolve({ locale: 'ar' }) });
        render(page);

        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

        // Main heading should mention knowledge/technology/articles
        expect(
            screen.getByRole('heading', { level: 1, name: /مدونة|التكنولوجيا|المعرفة/i })
        ).toBeInTheDocument();

        // Search bar should be present
        expect(screen.getByPlaceholderText(/ابحث في المقالات/i)).toBeInTheDocument();
    });
});

