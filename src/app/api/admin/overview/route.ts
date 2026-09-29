import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

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

    const [achievements, projects, files, sections] = await Promise.all([
        countRows('achievements'),
        countRows('projects'),
        countRows('uploaded_files'),
        supabaseAdmin.from('site_content').select('key, updated_at').order('updated_at', { ascending: false }),
    ]);

    if (sections.error) {
        console.error('Supabase site_content list error:', sections.error.message);
    }

    return NextResponse.json(
        {
            counts: { achievements, projects, files },
            sectionUpdates: sections.data ?? [],
        },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}
