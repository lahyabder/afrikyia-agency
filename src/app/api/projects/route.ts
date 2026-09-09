import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

// Fallback: read from local JSON file
function readLocalData() {
    try {
        const filePath = path.join(process.cwd(), 'src', 'data', 'projects.json');
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
        link: row.link,
        video: row.video,
        image: row.image,
        en: row.en || {},
        fr: row.fr || {},
        ar: row.ar || {}
    };
}

export async function GET() {
    try {
        const localData = readLocalData();
        let { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Supabase GET projects error:', error.message);
            return NextResponse.json(localData);
        }

        // Auto-seed Supabase if empty
        if ((!data || data.length === 0) && localData.length > 0) {
            const dbRows = localData.map((item: any) => ({
                id: item.id,
                link: item.link || '#',
                video: item.video || null,
                image: item.image || null,
                en: item.en || {},
                fr: item.fr || {},
                ar: item.ar || {}
            }));
            
            const { error: seedError } = await supabaseAdmin.from('projects').insert(dbRows);
            if (seedError) {
                console.error('Failed to seed projects:', seedError.message);
            } else {
                const refetch = await supabaseAdmin.from('projects').select('*').order('created_at', { ascending: true });
                data = refetch.data || [];
            }
        }

        if (data && data.length > 0) {
            return NextResponse.json(data.map(transformRow));
        }

        return NextResponse.json(localData);
    } catch (err) {
        console.error('GET projects error:', err);
        return NextResponse.json(readLocalData());
    }
}

export async function POST(request: Request) {
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

        return NextResponse.json({
            success: true,
            data: (updatedData || []).map(transformRow)
        });
    } catch (error: any) {
        console.error('POST projects error:', error);
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
