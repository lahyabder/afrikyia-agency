import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';
import { isSiteContentKey } from '@/lib/siteContent';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ key: string }> };

// Public: read the saved content of one website section (null = use default texts)
export async function GET(_request: Request, { params }: Params) {
    const { key } = await params;
    if (!isSiteContentKey(key)) {
        return NextResponse.json({ error: 'UnknownSection' }, { status: 404 });
    }

    const { data, error } = await supabaseAdmin
        .from('site_content')
        .select('data, updated_at')
        .eq('key', key)
        .maybeSingle();

    if (error) {
        console.error(`Supabase GET content "${key}" error:`, error.message);
        return NextResponse.json({ data: null }, { status: 500 });
    }

    return NextResponse.json(
        { data: data?.data ?? null, updatedAt: data?.updated_at ?? null },
        { headers: { 'Cache-Control': 'no-store' } }
    );
}

// Admin: save the content of one website section
export async function PUT(request: Request, { params }: Params) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const { key } = await params;
    if (!isSiteContentKey(key)) {
        return NextResponse.json({ error: 'UnknownSection' }, { status: 404 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('site_content')
        .upsert({ key, data: body, updated_at: new Date().toISOString() });

    if (error) {
        console.error(`Supabase PUT content "${key}" error:`, error.message);
        return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

// Admin: reset one website section to its default texts
export async function DELETE(request: Request, { params }: Params) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const { key } = await params;
    if (!isSiteContentKey(key)) {
        return NextResponse.json({ error: 'UnknownSection' }, { status: 404 });
    }

    const { error } = await supabaseAdmin.from('site_content').delete().eq('key', key);
    if (error) {
        console.error(`Supabase DELETE content "${key}" error:`, error.message);
        return NextResponse.json({ error: 'DatabaseError', message: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
