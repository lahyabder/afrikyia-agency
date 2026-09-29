import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';
import { SITE_CONTENT_KEYS } from '@/lib/siteContent';

export const dynamic = 'force-dynamic';

async function countRows(table: string): Promise<number | null> {
    const { count, error } = await supabaseAdmin.from(table).select('*', { count: 'exact', head: true });
    if (error) {
        console.error(`Supabase count "${table}" error:`, error.message);
        return null;
    }
    return count ?? 0;
}

// Admin dashboard figures, read from the database
export async function GET(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const [achievements, projects, files, sections, newMessages, latestMessages] = await Promise.all([
        countRows('achievements'),
        countRows('projects'),
        countRows('uploaded_files'),
        supabaseAdmin.from('site_content').select('key, updated_at').in('key', [...SITE_CONTENT_KEYS]).order('updated_at', { ascending: false }),
        supabaseAdmin.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        supabaseAdmin
            .from('contact_messages')
            .select('id, name, message, created_at')
            .eq('status', 'new')
            .order('created_at', { ascending: false })
            .limit(5),
    ]);

    if (sections.error) {
        console.error('Supabase site_content list error:', sections.error.message);
    }

    return NextResponse.json(
        {
            counts: { achievements, projects, files, newMessages: newMessages.error ? null : newMessages.count ?? 0 },
            sectionUpdates: sections.data ?? [],
            latestMessages: latestMessages.data ?? [],
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}
