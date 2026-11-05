import { NextResponse } from 'next/server';
import { loadBlogArticles } from '@/lib/blogStore';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const articles = await loadBlogArticles(false); // only published
        return NextResponse.json(
            { articles },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'CDN-Cache-Control': 'no-store',
                    'Surrogate-Control': 'no-store',
                    'Pragma': 'no-cache',
                },
            }
        );
    } catch {
        return NextResponse.json({ articles: [] }, { status: 500 });
    }
}

