import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
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

