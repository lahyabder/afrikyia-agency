import { NextResponse } from 'next/server';
import { getSessionUser, requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import {
    loadBlogArticles,
    createBlogArticle,
    updateBlogArticle,
    deleteBlogArticle,
    toggleBlogArticlePublish,
} from '@/lib/blogStore';
import { validateBlogPost, type BlogPost } from '@/data/blog';

export const dynamic = 'force-dynamic';

// GET /api/admin/blog: Return all articles with stats
export async function GET(request: Request) {
    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const articles = await loadBlogArticles(true);
        const categoriesSet = new Set(articles.map(a => a.category));

        const stats = {
            total: articles.length,
            published: articles.filter(a => a.isPublished !== false).length,
            drafts: articles.filter(a => a.isPublished === false).length,
            categories: categoriesSet.size,
        };

        return NextResponse.json({ articles, stats });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to load blog articles' },
            { status: 500 }
        );
    }
}

// POST /api/admin/blog: Create a new blog article
export async function POST(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'BadRequest: Invalid JSON' }, { status: 400 });
    }

    try {
        const articles = await createBlogArticle(body);
        await logActivity(gate.user, 'create', 'blog');
        return NextResponse.json({ articles }, { status: 201 });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to create article' },
            { status: 400 }
        );
    }
}

// PUT /api/admin/blog: Update an article or toggle publish
export async function PUT(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'BadRequest: Invalid JSON' }, { status: 400 });
    }

    const { slug, action, ...updates } = body || {};
    if (!slug || typeof slug !== 'string') {
        return NextResponse.json({ error: 'Article slug is required' }, { status: 400 });
    }

    try {
        let articles: BlogPost[];
        if (action === 'togglePublish') {
            articles = await toggleBlogArticlePublish(slug);
        } else {
            articles = await updateBlogArticle(slug, updates);
        }

        await logActivity(gate.user, 'update', 'blog');
        return NextResponse.json({ articles });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to update article' },
            { status: 400 }
        );
    }
}

// DELETE /api/admin/blog?slug=...: Delete an article
export async function DELETE(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Missing article slug parameter' }, { status: 400 });
    }

    try {
        const articles = await deleteBlogArticle(slug);
        await logActivity(gate.user, 'delete', 'blog');
        return NextResponse.json({ articles, success: true });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to delete article' },
            { status: 400 }
        );
    }
}

