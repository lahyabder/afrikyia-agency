import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BlogList from './BlogList';
import { getAllArticles } from '@/data/blog';

// Mock routing Link
vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href, className }: any) => (
        <a href={href} className={className}>
            {children}
        </a>
    ),
}));

describe('BlogList Component', () => {
    const articles = getAllArticles();

    it('renders search input, category filters, and articles list', () => {
        render(<BlogList articles={articles} locale="ar" />);

        expect(screen.getByPlaceholderText(/ابحث في المقالات|البحث/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /جميع المقالات|الكل/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /تكنولوجيا/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /دراسات/i })).toBeInTheDocument();

        // Articles should be rendered
        expect(screen.getByText(articles[0].title.ar)).toBeInTheDocument();
    });

    it('filters articles when a category is selected', () => {
        render(<BlogList articles={articles} locale="ar" />);

        const studiesBtn = screen.getByRole('button', { name: /دراسات/i });
        fireEvent.click(studiesBtn);

        // Studies article should be visible
        const studiesArticles = articles.filter(a => a.category === 'studies');
        expect(screen.getByText(studiesArticles[0].title.ar)).toBeInTheDocument();

        // Articles from other categories should not be shown
        const techArticles = articles.filter(a => a.category === 'technology');
        expect(screen.queryByText(techArticles[0].title.ar)).not.toBeInTheDocument();
    });

    it('filters articles by search input', () => {
        render(<BlogList articles={articles} locale="ar" />);

        const searchInput = screen.getByPlaceholderText(/ابحث في المقالات|البحث/i);
        fireEvent.change(searchInput, { target: { value: 'AcceSpan' } });

        // Port logistics article mentions AcceSpan
        const portArticle = articles.find(a => a.slug === 'port-logistics-digital-transformation');
        expect(screen.getByText(portArticle!.title.ar)).toBeInTheDocument();

        // Unrelated article should be hidden
        const cloudArticle = articles.find(a => a.slug === 'cloud-native-architecture-africa');
        expect(screen.queryByText(cloudArticle!.title.ar)).not.toBeInTheDocument();
    });

    it('displays empty state when no article matches search', () => {
        render(<BlogList articles={articles} locale="ar" />);

        const searchInput = screen.getByPlaceholderText(/ابحث في المقالات|البحث/i);
        fireEvent.change(searchInput, { target: { value: 'xyzrandomnotfound999' } });

        expect(screen.getByText(/لم يتم العثور على مقالات|لا توجد مقالات/i)).toBeInTheDocument();
    });
});

