import { supabaseAdmin } from '@/lib/supabase';
import {
    BLOG_POSTS,
    validateBlogPost,
    type BlogPost,
} from '@/data/blog';

export const BLOG_CONTENT_KEY = 'company_blog';

export async function loadBlogArticles(includeDrafts = true): Promise<BlogPost[]> {
    try {
        const { data, error } = await supabaseAdmin
            .from('site_content')
            .select('data')
            .eq('key', BLOG_CONTENT_KEY)
            .maybeSingle();

        if (error || !data || !Array.isArray(data.data) || data.data.length === 0) {
            return includeDrafts
                ? BLOG_POSTS
                : BLOG_POSTS.filter(a => a.isPublished !== false);
        }

        const list = data.data as BlogPost[];
        return includeDrafts
            ? list
            : list.filter(a => a.isPublished !== false);
    } catch (e) {
        console.error('Failed to load blog articles from site_content:', e);
        return includeDrafts
            ? BLOG_POSTS
            : BLOG_POSTS.filter(a => a.isPublished !== false);
    }
}

export async function saveBlogArticles(articles: BlogPost[]): Promise<BlogPost[]> {
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
        .from('site_content')
        .upsert(
            {
                key: BLOG_CONTENT_KEY,
                data: articles,
                updated_at: now,
            },
            { onConflict: 'key' }
        );

    if (error) {
        throw new Error(`Failed to save blog articles: ${error.message}`);
    }

    return articles;
}

export async function createBlogArticle(
    input: Partial<BlogPost>
): Promise<BlogPost[]> {
    // Generate slug from input or title if missing
    let slug = (input.slug || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    if (!slug) {
        const titleEn = input.title?.en || input.title?.fr || '';
        slug = titleEn.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `post-${Date.now()}`;
    }

    const now = new Date().toISOString();
    const today = now.slice(0, 10);

    const fullArticle: BlogPost = {
        slug,
        category: input.category || 'technology',
        title: {
            ar: input.title?.ar || '',
            en: input.title?.en || '',
            fr: input.title?.fr || '',
        },
        excerpt: {
            ar: input.excerpt?.ar || '',
            en: input.excerpt?.en || '',
            fr: input.excerpt?.fr || '',
        },
        content: {
            ar: input.content?.ar || [{ body: [] }],
            en: input.content?.en || [],
            fr: input.content?.fr || [],
        },
        author: {
            name: input.author?.name || 'AFRIKYIA Engineering',
            role: input.author?.role || 'Contributor',
            avatar: input.author?.avatar,
        },
        publishedAt: input.publishedAt || today,
        readTime: input.readTime || {
            ar: '5 دقائق قراءة',
            en: '5 min read',
            fr: '5 min de lecture',
        },
        featured: input.featured ?? false,
        isPublished: input.isPublished ?? true,
        tags: Array.isArray(input.tags) ? input.tags : [],
        coverGradient: input.coverGradient || 'from-indigo-600 via-blue-600 to-indigo-900',
        iconName: input.iconName,
        createdAt: now,
        updatedAt: now,
    };

    const validation = validateBlogPost(fullArticle);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const current = await loadBlogArticles(true);
    if (current.some(a => a.slug === slug)) {
        throw new Error(`An article with slug "${slug}" already exists`);
    }

    const updated = [fullArticle, ...current];
    return saveBlogArticles(updated);
}

export async function updateBlogArticle(
    slug: string,
    updates: Partial<BlogPost>
): Promise<BlogPost[]> {
    const current = await loadBlogArticles(true);
    const idx = current.findIndex(a => a.slug === slug);
    if (idx === -1) {
        throw new Error(`Article with slug "${slug}" not found`);
    }

    const now = new Date().toISOString();
    const merged: BlogPost = {
        ...current[idx],
        ...updates,
        slug, // ensure slug cannot be silently broken
        updatedAt: now,
    };

    const validation = validateBlogPost(merged);
    if (!validation.valid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
    }

    const updatedList = [...current];
    updatedList[idx] = merged;
    return saveBlogArticles(updatedList);
}

export async function toggleBlogArticlePublish(slug: string): Promise<BlogPost[]> {
    const current = await loadBlogArticles(true);
    const idx = current.findIndex(a => a.slug === slug);
    if (idx === -1) {
        throw new Error(`Article with slug "${slug}" not found`);
    }

    const now = new Date().toISOString();
    const target = current[idx];
    const newStatus = target.isPublished === false ? true : false;

    const updatedList = [...current];
    updatedList[idx] = {
        ...target,
        isPublished: newStatus,
        updatedAt: now,
    };
    return saveBlogArticles(updatedList);
}

export async function deleteBlogArticle(slug: string): Promise<BlogPost[]> {
    const current = await loadBlogArticles(true);
    const filtered = current.filter(a => a.slug !== slug);
    if (filtered.length === current.length) {
        throw new Error(`Article with slug "${slug}" not found`);
    }

    return saveBlogArticles(filtered);
}
