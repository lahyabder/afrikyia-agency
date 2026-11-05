import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@/components/admin/BlogManager', () => ({
    default: () => <div data-testid="blog-manager">Blog Manager Component</div>,
}));

vi.mock('@/context/LanguageContext', () => ({
    useLanguage: () => ({
        t: {
            admin: {
                blog: {
                    title: 'إدارة المدونة والمقالات',
                    subtitle: 'إضافة وتعديل وحذف ونشر المقالات التقنية والمعرفية على موقع أفريقيا',
                },
            },
        },
        language: 'ar',
        isRTL: true,
    }),
}));

import AdminBlogPage from './page';

describe('AdminBlogPage', () => {
    it('renders the blog management title, subtitle, and BlogManager component', () => {
        render(<AdminBlogPage />);

        expect(screen.getByText(/إدارة المدونة والمقالات/i)).toBeInTheDocument();
        expect(screen.getByText(/إضافة وتعديل وحذف ونشر المقالات/i)).toBeInTheDocument();
        expect(screen.getByTestId('blog-manager')).toBeInTheDocument();
    });
});

