import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { authenticate, getSessionUser, hashPassword } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { readJson } from '@/lib/biz';

export const dynamic = 'force-dynamic';

// A team member changes their own password. The owner's password lives in the hosting settings.
export async function PATCH(request: Request) {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.owner) return NextResponse.json({ error: 'OwnerPassword' }, { status: 400 });
    const body = await readJson(request);
    const current = typeof body?.current === 'string' ? body.current : '';
    const next = typeof body?.next === 'string' ? body.next : '';
    if (next.length < 8) return NextResponse.json({ error: 'WeakPassword' }, { status: 400 });
    if (!(await authenticate(user.email, current))) return NextResponse.json({ error: 'WrongPassword' }, { status: 403 });

    const { data: row } = await supabaseAdmin.from('admin_users').select('session_version').eq('id', user.id).single();
    const { error } = await supabaseAdmin
        .from('admin_users')
        .update({ password_hash: hashPassword(next), session_version: (row?.session_version ?? 1) + 1, updated_at: new Date().toISOString() })
        .eq('id', user.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(user, 'change_password', 'user', user.email, user.id);
    return NextResponse.json({ success: true });
}
