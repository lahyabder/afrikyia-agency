import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';
import { PARTY_TYPES, readJson, text } from '@/lib/biz';

export const dynamic = 'force-dynamic';

const FIELDS = 'id, name, type, nif, rc, address, phone, email, created_at';

function partyFields(body: Record<string, unknown>) {
    const type = PARTY_TYPES.includes(body.type as (typeof PARTY_TYPES)[number]) ? (body.type as string) : 'client';
    return {
        name: text(body.name, 200),
        type,
        nif: text(body.nif, 50),
        rc: text(body.rc, 50),
        address: text(body.address, 500),
        phone: text(body.phone, 50),
        email: text(body.email, 200),
    };
}

export async function GET(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const { data, error } = await supabaseAdmin.from('parties').select(FIELDS).order('name');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const body = await readJson(request);
    const fields = body && partyFields(body);
    if (!fields?.name) return NextResponse.json({ error: 'NameRequired' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('parties').insert(fields).select(FIELDS).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function PATCH(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const body = await readJson(request);
    const id = text(body?.id, 64);
    const fields = body && partyFields(body);
    if (!id || !fields?.name) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('parties').update(fields).eq('id', id).select(FIELDS).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function DELETE(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    // Keep the history: a client with invoices or expenses cannot be removed
    const [inv, exp] = await Promise.all([
        supabaseAdmin.from('accounting_invoices').select('id', { count: 'exact', head: true }).eq('party_id', id),
        supabaseAdmin.from('accounting_expenses').select('id', { count: 'exact', head: true }).eq('party_id', id),
    ]);
    if ((inv.count ?? 0) + (exp.count ?? 0) > 0) return NextResponse.json({ error: 'InUse' }, { status: 409 });
    const { error } = await supabaseAdmin.from('parties').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
