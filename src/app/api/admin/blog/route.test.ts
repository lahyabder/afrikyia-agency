import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/adminAuth', () => ({
    getSessionUser: vi.fn(),
    requireAccess: vi.fn(),
}));

vi.mock('@/lib/activity', () => ({
    logActivity: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/blogStore', () => ({
    loadBlogArticles: vi.fn(),
    createBlogArticle: vi.fn(),
    updateBlogArticle: vi.fn(),
    deleteBlogArticle: vi.fn(),
    toggleBlogArticlePublish: vi.fn(),
}));

import { getSessionUser, requireAccess } from '@/lib/adminAuth';
import {
    loadBlogArticles,
    createBlogArticle,
    updateBlogArticle,
    deleteBlogArticle,
    toggleBlogArticlePublish,
} from '@/lib/blogStore';
import { GET, POST, PUT, DELETE } from './route';

const mockUser = { id: 'u1', email: 'admin@afrikyia.com', name: 'Admin', role: 'admin' as const, owner: true };
const mockArticles = [
    {
        slug: 'article-1',
        category: 'technology' as const,
        title: { ar: 'مقال 1', en: 'Article 1', fr: 'Article 1' },
        excerpt: { ar: 'ملخص 1', en: 'Excerpt 1', fr: 'Excerpt 1' },
        content: { ar: [], en: [], fr: [] },
        author: { name: 'Author 1', role: 'Dev' },
        publishedAt: '2026-11-04',
        readTime: { ar: '5 دقائق', en: '5 min', fr: '5 min' },
        tags: ['Tech'],
        coverGradient: 'from-blue-600 to-indigo-900',
        isPublished: true,
    },
    {
        slug: 'article-draft',
        category: 'news' as const,
        title: { ar: 'مسودة', en: 'Draft', fr: 'Brouillon' },
        excerpt: { ar: 'ملخص مسودة', en: 'Draft excerpt', fr: 'Draft excerpt' },
        content: { ar: [], en: [], fr: [] },
        author: { name: 'Author 2', role: 'Editor' },
        publishedAt: '2026-11-04',
        readTime: { ar: '2 دقيقة', en: '2 min', fr: '2 min' },
        tags: ['News'],
        coverGradient: 'from-rose-600 to-red-900',
        isPublished: false,
    },
];

describe('Admin Blog API (/api/admin/blog)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('rejects unauthenticated GET requests', async () => {
        vi.mocked(getSessionUser).mockResolvedValueOnce(null);
        const req = new Request('https://afrikyia.com/api/admin/blog');
        const res = await GET(req);
        expect(res.status).toBe(401);
    });

    it('returns all articles and calculated stats for authenticated admin', async () => {
        vi.mocked(getSessionUser).mockResolvedValueOnce(mockUser as any);
        vi.mocked(loadBlogArticles).mockResolvedValueOnce(mockArticles);

        const req = new Request('https://afrikyia.com/api/admin/blog');
        const res = await GET(req);
        expect(res.status).toBe(200);

        const data = await res.json();
        expect(data.articles).toEqual(mockArticles);
        expect(data.stats).toEqual({
            total: 2,
            published: 1,
            drafts: 1,
            categories: 2,
        });
    });

    it('creates a new article via POST', async () => {
        vi.mocked(requireAccess).mockResolvedValueOnce({ user: mockUser as any });
        vi.mocked(createBlogArticle).mockResolvedValueOnce([...mockArticles]);

        const req = new Request('https://afrikyia.com/api/admin/blog', {
            method: 'POST',
            body: JSON.stringify({
                slug: 'new-article',
                category: 'studies',
                title: { ar: 'دراسة جديدة', en: 'New Study', fr: 'Nouvelle étude' },
                excerpt: { ar: 'ملخص', en: 'Summary', fr: 'Résumé' },
            }),
        });

        const res = await POST(req);
        expect(res.status).toBe(201);
        const data = await res.json();
        expect(data.articles).toBeDefined();
        expect(createBlogArticle).toHaveBeenCalled();
    });

    it('updates an article via PUT', async () => {
        vi.mocked(requireAccess).mockResolvedValueOnce({ user: mockUser as any });
        vi.mocked(updateBlogArticle).mockResolvedValueOnce(mockArticles);

        const req = new Request('https://afrikyia.com/api/admin/blog', {
            method: 'PUT',
            body: JSON.stringify({
                slug: 'article-1',
                title: { ar: 'مقال 1 معدل', en: 'Article 1 Updated', fr: 'Article 1 Mis à jour' },
            }),
        });

        const res = await PUT(req);
        expect(res.status).toBe(200);
        expect(updateBlogArticle).toHaveBeenCalledWith(
            'article-1',
            expect.objectContaining({
                title: expect.objectContaining({ ar: 'مقال 1 معدل' }),
            })
        );
    });

    it('toggles article publish status via PUT when togglePublish flag is passed', async () => {
        vi.mocked(requireAccess).mockResolvedValueOnce({ user: mockUser as any });
        vi.mocked(toggleBlogArticlePublish).mockResolvedValueOnce(mockArticles);

        const req = new Request('https://afrikyia.com/api/admin/blog', {
            method: 'PUT',
            body: JSON.stringify({
                slug: 'article-draft',
                action: 'togglePublish',
            }),
        });

        const res = await PUT(req);
        expect(res.status).toBe(200);
        expect(toggleBlogArticlePublish).toHaveBeenCalledWith('article-draft');
    });

    it('deletes an article via DELETE', async () => {
        vi.mocked(requireAccess).mockResolvedValueOnce({ user: mockUser as any });
        vi.mocked(deleteBlogArticle).mockResolvedValueOnce([]);

        const req = new Request('https://afrikyia.com/api/admin/blog?slug=article-1', {
            method: 'DELETE',
        });

        const res = await DELETE(req);
        expect(res.status).toBe(200);
        expect(deleteBlogArticle).toHaveBeenCalledWith('article-1');
    });
});

