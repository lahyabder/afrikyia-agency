import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import BlogPostPage, { generateStaticParams } from './page';

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

describe('Single Article Page (/blog/[slug])', () => {
    it('generates static params for all locales and articles', async () => {
        const params = await generateStaticParams();
        expect(params.length).toBeGreaterThanOrEqual(15); // 3 locales * at least 5 articles
        expect(params[0]).toHaveProperty('locale');
        expect(params[0]).toHaveProperty('slug');
    });

    it('renders article content and author for a valid slug', async () => {
        const page = await BlogPostPage({
            params: Promise.resolve({
                locale: 'ar',
                slug: 'cloud-native-architecture-africa',
            }),
        });

        render(page);

        // Header & Footer
        expect(screen.getByTestId('mock-header')).toBeInTheDocument();
        expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

        // Title and author
        expect(
            screen.getByRole('heading', {
                level: 1,
                name: /هندسة النظم السحابية الموزعة/i,
            })
        ).toBeInTheDocument();

        expect(screen.getByText(/فريق الهندسة في AFRIKYIA/i)).toBeInTheDocument();

        // Breadcrumb and back links to blog
        const blogLinks = screen.getAllByRole('link', { name: /المدونة|مدونة/i });
        expect(blogLinks.length).toBeGreaterThan(0);
        blogLinks.forEach(link => {
            expect(link).toHaveAttribute('href', '/blog');
        });
    });
});
