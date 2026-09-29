import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccess, getSessionUser, requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { readJson } from '@/lib/biz';

export const dynamic = 'force-dynamic';

// The company stamp and signature. They are kept in the database (never in the public site files)
// and only served to signed-in team members who issue documents.
const KEY = 'company_seals';
const MAX_BYTES = 400 * 1024;
const DATA_URL = /^data:image\/(png|webp|jpeg);base64,[A-Za-z0-9+/=]+$/;

type Seals = { stamp: string | null; signature: string | null };

export async function GET(request: Request) {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canAccess(user, 'finance') && !canAccess(user, 'hr')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    const { data } = await supabaseAdmin.from('site_content').select('data').eq('key', KEY).maybeSingle();
    const seals = (data?.data ?? {}) as Partial<Seals>;
    return NextResponse.json(
        { stamp: seals.stamp ?? null, signature: seals.signature ?? null },
        { headers: { 'Cache-Control': 'private, no-store' } }
    );
}

// Replace or remove one image (administrators only)
export async function PUT(request: Request) {
    const gate = await requireAccess(request, 'users');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const { data } = await supabaseAdmin.from('site_content').select('data').eq('key', KEY).maybeSingle();
    const seals: Seals = { stamp: null, signature: null, ...((data?.data ?? {}) as Partial<Seals>) };
    for (const field of ['stamp', 'signature'] as const) {
        if (!body || !(field in body)) continue;
        const value = body[field];
        if (value === null) seals[field] = null;
        else if (typeof value === 'string' && DATA_URL.test(value) && value.length <= MAX_BYTES * 1.4) seals[field] = value;
        else return NextResponse.json({ error: 'BadImage' }, { status: 400 });
    }
    const { error } = await supabaseAdmin.from('site_content').upsert({ key: KEY, data: seals, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'update', 'company_seals');
    return NextResponse.json({ stamp: seals.stamp, signature: seals.signature });
}
