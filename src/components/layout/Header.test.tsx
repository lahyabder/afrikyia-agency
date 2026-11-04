import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import Header from './Header';

// Mock next-intl routing Link
vi.mock('@/i18n/routing', () => ({
    Link: ({ children, href, onClick, className }: any) => (
        <a href={href} onClick={onClick} className={className}>
            {children}
        </a>
    ),
}));

// Mock LanguageSwitcher
vi.mock('./LanguageSwitcher', () => ({
    default: () => <div data-testid="language-switcher">LangSwitch</div>,
}));

// Mock LanguageContext
vi.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            home: {
                nav: {
                    home: 'الرئيسية',
                    solutions: 'حلولنا',
                    products: 'منتجاتنا',
                    works: 'مشاريعنا',
                    blog: 'مدونة',
                    about: 'عن الشركة',
                    contact: 'تواصل معنا',
                    menu: 'القائمة',
                },
            },
        },
        isRTL: true,
        language: 'ar',
    }),
}));

describe('Header Navigation with Blog', () => {
    it('renders the official blog link in desktop navigation', () => {
        render(<Header />);
        const blogLinks = screen.getAllByRole('link', { name: /مدونة|المدونة|Blog/i });
        expect(blogLinks.length).toBeGreaterThan(0);
        expect(blogLinks[0]).toHaveAttribute('href', '/blog');
    });

    it('renders the blog link in mobile navigation when menu is opened', () => {
        render(<Header />);
        const menuBtn = screen.getByRole('button', { name: /القائمة|Menu/i });
        fireEvent.click(menuBtn);

        const blogLinks = screen.getAllByRole('link', { name: /مدونة|المدونة|Blog/i });
        expect(blogLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
    });
});

