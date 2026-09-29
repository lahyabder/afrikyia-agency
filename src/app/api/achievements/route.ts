import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Fallback: read from local JSON file
function readLocalData() {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'achievements.json');
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch {
        return [];
    }
}

// Transform DB row to frontend format
function transformRow(row: any) {
    return {
        id: row.id,
        category: row.category,
        link: row.link,
        image: row.image,
        video: row.video || undefined,
        gallery: row.gallery || [],
        en: row.en || {},
        fr: row.fr || {},
        ar: row.ar || {},
        year: row.year,
        client: row.client,
        projectType: row.project_type
    };
}

export async function GET() {
    // The database is the only source once it is reachable: an empty table stays empty,
    // so deleted items never come back from the old seed file.
    const { data, error } = await supabaseAdmin.from('achievements').select('*').order('created_at', { ascending: true });
    if (error) {
        console.error('Supabase GET achievements error:', error.message);
        return NextResponse.json(readLocalData());
    }
    return NextResponse.json((data ?? []).map(transformRow));
}

export async function POST(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    try {
        const body = await request.json();
        const { action, achievement } = body;

        const dbRow = {
            id: achievement.id,
            category: achievement.category,
            link: achievement.link,
            image: achievement.image,
            video: achievement.video || null,
            gallery: achievement.gallery || [],
            en: achievement.en,
            fr: achievement.fr,
            ar: achievement.ar,
            year: achievement.year,
            client: achievement.client,
            project_type: achievement.projectType
        };

        if (action === 'add' || action === 'edit') {
            const { error } = await supabaseAdmin.from('achievements').upsert(dbRow);
            if (error) {
                console.error(`Supabase ${action} error:`, error);
                return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
            }
        } else if (action === 'delete') {
            const { error } = await supabaseAdmin
                .from('achievements')
                .delete()
                .eq('id', achievement.id);

            if (error) {
                console.error('Supabase delete error:', error);
                return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
            }
        }

        await logActivity(gate.user, action, 'achievement', achievement?.ar?.title || achievement?.fr?.title || achievement?.en?.title, achievement?.id);

        // Return updated list
        const { data: updatedData } = await supabaseAdmin
            .from('achievements')
            .select('*')
            .order('created_at', { ascending: true });

        // If the database is still empty after a delete (e.g., deleted the last item), 
        // we should probably return empty array rather than triggering a re-seed on next GET.
        return NextResponse.json({
            success: true,
            data: (updatedData || []).map(transformRow)
        });
    } catch (error: any) {
        console.error('POST achievements error:', error);
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
