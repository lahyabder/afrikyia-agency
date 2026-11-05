import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import BlogManager from './BlogManager';

const mockArticles = [
    {
        slug: 'first-tech-article',
        category: 'technology' as const,
        title: { ar: 'مقال التكنولوجيا الأول', en: 'First Tech Post', fr: 'Premier Post Tech' },
        excerpt: { ar: 'ملخص المقال', en: 'Excerpt', fr: 'Extrait' },
        content: { ar: [{ heading: 'مقدمة', body: ['نص المقال'] }], en: [], fr: [] },
        author: { name: 'مهندس أحمد', role: 'Cloud Architect' },
        publishedAt: '2026-11-04',
        readTime: { ar: '5 دقائق', en: '5 min', fr: '5 min' },
        tags: ['Cloud', 'DevOps'],
        coverGradient: 'from-indigo-600 to-blue-900',
        isPublished: true,
        featured: true,
    },
    {
        slug: 'draft-study',
        category: 'studies' as const,
        title: { ar: 'دراسة غير منشورة', en: 'Draft Study', fr: 'Étude Brouillon' },
        excerpt: { ar: 'ملخص دراسة', en: 'Excerpt', fr: 'Extrait' },
        content: { ar: [{ heading: 'نظرة عامة', body: ['تفاصيل'] }], en: [], fr: [] },
        author: { name: 'د. مريم', role: 'Data Scientist' },
        publishedAt: '2026-11-03',
        readTime: { ar: '3 دقائق', en: '3 min', fr: '3 min' },
        tags: ['Data'],
        coverGradient: 'from-blue-600 to-slate-900',
        isPublished: false,
        featured: false,
    },
];

describe('BlogManager Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.fetch = vi.fn().mockImplementation((url, options) => {
            const method = options?.method || 'GET';
            if (method === 'GET') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        articles: mockArticles,
                        stats: { total: 2, published: 1, drafts: 1, categories: 2 },
                    }),
                });
            }
            if (method === 'POST') {
                const body = JSON.parse(options.body);
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        articles: [body, ...mockArticles],
                    }),
                });
            }
            if (method === 'PUT') {
                const body = JSON.parse(options.body);
                if (body.action === 'togglePublish') {
                    return Promise.resolve({
                        ok: true,
                        json: async () => ({
                            articles: mockArticles.map(a =>
                                a.slug === body.slug ? { ...a, isPublished: !a.isPublished } : a
                            ),
                        }),
                    });
                }
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        articles: mockArticles.map(a =>
                            a.slug === body.slug ? { ...a, ...body } : a
                        ),
                    }),
                });
            }
            if (method === 'DELETE') {
                return Promise.resolve({
                    ok: true,
                    json: async () => ({
                        articles: mockArticles.filter(a => a.slug !== 'first-tech-article'),
                        success: true,
                    }),
                });
            }
            return Promise.resolve({ ok: true, json: async () => ({}) });
        });
    });

    it('renders articles and KPI statistics', async () => {
        render(<BlogManager />);
        expect(await screen.findByText('مقال التكنولوجيا الأول')).toBeInTheDocument();
        expect(screen.getByText('دراسة غير منشورة')).toBeInTheDocument();
        expect(screen.getByText('مهندس أحمد')).toBeInTheDocument();
    });

    it('opens add modal, fills form, and creates a new article', async () => {
        render(<BlogManager />);
        await screen.findByText('مقال التكنولوجيا الأول');

        const addBtn = screen.getByRole('button', { name: /كتابة مقال|إضافة مقال|Nouveau|New article/i });
        fireEvent.click(addBtn);

        // Fill Title
        const titleInput = screen.getByPlaceholderText(/عنوان المقال بالعربية/i);
        fireEvent.change(titleInput, { target: { value: 'مقال ذكاء اصطناعي جديد' } });

        // Fill Excerpt
        const excerptInput = screen.getByPlaceholderText(/ملخص موجز للمقال/i);
        fireEvent.change(excerptInput, { target: { value: 'ملخص شامل للتطورات' } });

        // Submit
        const saveBtn = screen.getByRole('button', { name: /حفظ المقال ونشره|حفظ التعديلات/i });
        fireEvent.click(saveBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/admin/blog',
                expect.objectContaining({
                    method: 'POST',
                })
            );
        });
    });

    it('toggles article publication status (publish / unpublish)', async () => {
        render(<BlogManager />);
        await screen.findByText('مقال التكنولوجيا الأول');

        const toggleBtns = screen.getAllByRole('button', { name: /نشر|إيقاف النشر|تبديل النشر|Publier/i });
        fireEvent.click(toggleBtns[0]);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                '/api/admin/blog',
                expect.objectContaining({
                    method: 'PUT',
                    body: expect.stringContaining('togglePublish'),
                })
            );
        });
    });

    it('deletes an article after confirmation', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

        render(<BlogManager />);
        await screen.findByText('مقال التكنولوجيا الأول');

        const deleteBtns = screen.getAllByRole('button', { name: /حذف المقال|حذف|Supprimer|Delete/i });
        fireEvent.click(deleteBtns[0]);

        expect(confirmSpy).toHaveBeenCalled();
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/admin/blog?slug=first-tech-article'),
                expect.objectContaining({
                    method: 'DELETE',
                })
            );
        });
    });
});
