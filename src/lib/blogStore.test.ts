import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => ({
    supabaseAdmin: {
        from: vi.fn(),
    },
}));

import { supabaseAdmin } from '@/lib/supabase';
import {
    loadBlogArticles,
    createBlogArticle,
    updateBlogArticle,
    deleteBlogArticle,
    toggleBlogArticlePublish,
} from './blogStore';
import { BLOG_POSTS, type BlogPost } from '@/data/blog';

describe('Blog Store (site_content persistence)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns default BLOG_POSTS if nothing is stored in site_content', async () => {
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

        const articles = await loadBlogArticles();
        expect(articles.length).toBe(BLOG_POSTS.length);
        expect(articles[0].slug).toBe(BLOG_POSTS[0].slug);
    });

    it('returns stored articles when available in site_content', async () => {
        const stored: BlogPost[] = [
            {
                slug: 'test-custom-article',
                category: 'technology',
                title: { ar: 'مقال تجريبي', en: 'Test Post', fr: 'Post Test' },
                excerpt: { ar: 'ملخص تجريبي', en: 'Test excerpt', fr: 'Test excerpt' },
                content: { ar: [{ body: ['محتوى'] }], en: [], fr: [] },
                author: { name: 'Admin', role: 'Lead' },
                publishedAt: '2026-11-04',
                readTime: { ar: '3 دقائق', en: '3 min', fr: '3 min' },
                tags: ['Tech'],
                coverGradient: 'from-blue-600 to-indigo-900',
                isPublished: true,
            },
        ];

        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: stored }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect } as any);

        const articles = await loadBlogArticles();
        expect(articles.length).toBe(1);
        expect(articles[0].slug).toBe('test-custom-article');
    });

    it('creates a new article, sets timestamps, and persists to site_content', async () => {
        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: null, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const newPostData = {
            slug: 'new-breakthrough-ai',
            category: 'discoveries' as const,
            title: { ar: 'ابتكار جديد', en: 'New Breakthrough', fr: 'Nouvelle Découverte' },
            excerpt: { ar: 'ملخص المقال الجديد', en: 'Summary of new breakthrough', fr: 'Résumé' },
            content: { ar: [{ heading: 'مقدمة', body: ['نص تجريبي'] }], en: [], fr: [] },
            author: { name: 'Dr. Tech', role: 'Senior Researcher' },
            tags: ['AI', 'Research'],
            coverGradient: 'from-emerald-600 to-slate-900',
            isPublished: true,
        };

        const updatedList = await createBlogArticle(newPostData);
        expect(updatedList.length).toBe(BLOG_POSTS.length + 1);
        const created = updatedList.find(a => a.slug === 'new-breakthrough-ai');
        expect(created).toBeDefined();
        expect(created?.author.name).toBe('Dr. Tech');
        expect(mockUpsert).toHaveBeenCalled();
    });

    it('updates an existing article and persists changes', async () => {
        const existing: BlogPost[] = [
            {
                slug: 'existing-post',
                category: 'technology',
                title: { ar: 'مقال أصلي', en: 'Original', fr: 'Original' },
                excerpt: { ar: 'ملخص قديم', en: 'Old excerpt', fr: 'Old excerpt' },
                content: { ar: [{ body: ['محتوى'] }], en: [], fr: [] },
                author: { name: 'Editor', role: 'Staff' },
                publishedAt: '2026-11-01',
                readTime: { ar: '3 دقائق', en: '3 min', fr: '3 min' },
                tags: ['Original'],
                coverGradient: 'from-blue-600 to-indigo-900',
                isPublished: true,
            },
        ];

        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: existing }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const updated = await updateBlogArticle('existing-post', {
            title: { ar: 'مقال محدث بالكامل', en: 'Updated', fr: 'Mis à jour' },
        });

        expect(updated.length).toBe(1);
        expect(updated[0].title.ar).toBe('مقال محدث بالكامل');
        expect(mockUpsert).toHaveBeenCalled();
    });

    it('toggles article publication status (published vs draft)', async () => {
        const existing: BlogPost[] = [
            {
                slug: 'draft-post',
                category: 'technology',
                title: { ar: 'مسودة', en: 'Draft', fr: 'Brouillon' },
                excerpt: { ar: 'ملخص', en: 'Excerpt', fr: 'Extrait' },
                content: { ar: [{ body: ['محتوى'] }], en: [], fr: [] },
                author: { name: 'Editor', role: 'Staff' },
                publishedAt: '2026-11-01',
                readTime: { ar: '3 دقائق', en: '3 min', fr: '3 min' },
                tags: ['Draft'],
                coverGradient: 'from-blue-600 to-indigo-900',
                isPublished: false,
            },
        ];

        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: existing }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const updated = await toggleBlogArticlePublish('draft-post');
        expect(updated[0].isPublished).toBe(true);
    });

    it('deletes an article by slug and saves updated list', async () => {
        const existing: BlogPost[] = [
            {
                slug: 'to-delete',
                category: 'news',
                title: { ar: 'خبر للحذف', en: 'Delete Me', fr: 'Supprimer' },
                excerpt: { ar: 'ملخص', en: 'Excerpt', fr: 'Extrait' },
                content: { ar: [], en: [], fr: [] },
                author: { name: 'Editor', role: 'Staff' },
                publishedAt: '2026-11-01',
                readTime: { ar: '1 دقيقة', en: '1 min', fr: '1 min' },
                tags: [],
                coverGradient: 'from-red-600 to-rose-900',
                isPublished: true,
            },
        ];

        const mockMaybeSingle = vi.fn().mockResolvedValueOnce({ data: { data: existing }, error: null });
        const mockEq = vi.fn().mockReturnValue({ maybeSingle: mockMaybeSingle });
        const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
        const mockUpsert = vi.fn().mockResolvedValueOnce({ error: null });
        vi.mocked(supabaseAdmin.from).mockReturnValue({ select: mockSelect, upsert: mockUpsert } as any);

        const afterDelete = await deleteBlogArticle('to-delete');
        expect(afterDelete.length).toBe(0);
        expect(mockUpsert).toHaveBeenCalled();
    });
});

