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
        const { data, error } = await supabaseAdmin
            .from('projects')
            .select('*')
            .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
            return NextResponse.json(data.map(transformRow));
        }

        if (error) {
            console.error('Supabase GET projects error:', error.message);
        }

        return NextResponse.json(readLocalData());
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

        if (action === 'add') {
            const { error } = await supabaseAdmin.from('projects').insert(dbRow);
            if (error) {
                console.error('Supabase insert project error:', error);
                return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
            }
        } else if (action === 'edit') {
            const { id, ...updateFields } = dbRow;
            const { error } = await supabaseAdmin
                .from('projects')
                .update(updateFields)
                .eq('id', project.id);

            if (error) {
                console.error('Supabase update project error:', error);
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
