import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

// Transform DB row to frontend format
function transformRow(row: any) {
    return {
        id: row.id,
        link: row.link,
        video: row.video,
        image: row.image,
        en: row.en || {},
        fr: row.fr || {},
        ar: row.ar || {}
    };
}

export async function GET() {
    // The database is the only source once it is reachable: an empty table stays empty,
    // so deleted items never come back from the old seed file.
    const { data, error } = await supabaseAdmin.from('projects').select('*').order('created_at', { ascending: true });
    if (error) {
        console.error('Supabase GET projects error:', error.message);
        return NextResponse.json([]);
    }
    return NextResponse.json((data ?? []).map(transformRow));
}

export async function POST(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    try {
        const body = await request.json();
        const { action, project } = body;

        const dbRow = {
            id: project.id,
            link: project.link || '#',
            video: project.video || null,
            image: project.image || null,
            en: project.en,
            fr: project.fr,
            ar: project.ar
        };

        if (action === 'add' || action === 'edit') {
            const { error } = await supabaseAdmin.from('projects').upsert(dbRow);
            if (error) {
                console.error(`Supabase ${action} project error:`, error);
                return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
            }
        } else if (action === 'delete') {
            const { error } = await supabaseAdmin
                .from('projects')
                .delete()
                .eq('id', project.id);

            if (error) {
                console.error('Supabase delete project error:', error);
                return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
            }
        }

        // Return updated list
        const { data: updatedData } = await supabaseAdmin
            .from('projects')
            .select('*')
            .order('created_at', { ascending: true });

        await logActivity(gate.user, action, 'project', project?.ar?.title || project?.fr?.title || project?.en?.title, project?.id);

        return NextResponse.json({
            success: true,
            data: (updatedData || []).map(transformRow)
        });
    } catch (error: any) {
        console.error('POST projects error:', error);
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
