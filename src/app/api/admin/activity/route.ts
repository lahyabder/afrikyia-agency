import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Latest actions in the admin panel, newest first
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'users');
    if (gate.denied) return gate.denied;
    const url = new URL(request.url);
    const limit = Math.min(500, Math.max(1, Number(url.searchParams.get('limit')) || 200));
    let query = supabaseAdmin.from('admin_activity').select('*').order('created_at', { ascending: false }).limit(limit);
    const user = url.searchParams.get('user');
    if (user) query = query.eq('user_email', user);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}
