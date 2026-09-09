import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
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
    try {
        const { data, error } = await supabaseAdmin
            .from('achievements')
            .select('*')
            .order('created_at', { ascending: true });

        if (!error && data && data.length > 0) {
            return NextResponse.json(data.map(transformRow));
        }

        if (error) {
            console.error('Supabase GET error:', error.message);
        }

        // Fallback to local JSON
        return NextResponse.json(readLocalData());
    } catch (err) {
        console.error('GET achievements error:', err);
        return NextResponse.json(readLocalData());
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, achievement } = body;

        const dbRow = {
            id: achievement.id,
            category: achievement.category,
            link: achievement.link,
            image: achievement.image,
            gallery: achievement.gallery || [],
            en: achievement.en,
            fr: achievement.fr,
            ar: achievement.ar,
            year: achievement.year,
            client: achievement.client,
            project_type: achievement.projectType
        };

        if (action === 'add') {
            const { error } = await supabaseAdmin.from('achievements').insert(dbRow);
            if (error) {
                console.error('Supabase insert error:', error);
                return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
            }
        } else if (action === 'edit') {
            const { id, ...updateFields } = dbRow;
            const { error } = await supabaseAdmin
                .from('achievements')
                .update(updateFields)
                .eq('id', achievement.id);

            if (error) {
                console.error('Supabase update error:', error);
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

        // Return updated list
        const { data: updatedData } = await supabaseAdmin
            .from('achievements')
            .select('*')
            .order('created_at', { ascending: true });

        return NextResponse.json({
            success: true,
            data: (updatedData || []).map(transformRow)
        });
    } catch (error: any) {
        console.error('POST achievements error:', error);
        return NextResponse.json({ error: 'Server error', message: error.message }, { status: 500 });
    }
}
