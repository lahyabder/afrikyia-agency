import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { nextNumber, readJson, text } from '@/lib/biz';
import { LETTER_FIELDS, letterContent } from '@/lib/letters';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
    const { data } = await supabaseAdmin.from('company_letters').select(LETTER_FIELDS).eq('id', id).maybeSingle();
    return data;
}

export async function GET(request: Request, { params }: Params) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const letter = await load((await params).id);
    if (!letter) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    return NextResponse.json(letter);
}

// Letters are never deleted, so the numbered series stays complete:
// - action "save": edit the content (drafts only; once sent the copy is kept as issued)
// - action "status": mark as sent, cancel, or bring a cancelled letter back to draft
// - action "duplicate": a new draft with the same content and the next number
export async function PATCH(request: Request, { params }: Params) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const { id } = await params;
    const body = await readJson(request);
    const letter = await load(id);
    if (!body || !letter) return NextResponse.json({ error: 'NotFound' }, { status: 404 });

    if (body.action === 'save') {
        if (letter.status !== 'draft') return NextResponse.json({ error: 'Locked' }, { status: 409 });
        const content = letterContent(body);
        if (!content.subject) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
        const number = text(body.letter_number, 60) ?? letter.letter_number;
        const { error } = await supabaseAdmin
            .from('company_letters')
            .update({ ...content, letter_number: number, updated_at: new Date().toISOString() })
            .eq('id', id);
        if (error?.code === '23505') return NextResponse.json({ error: 'NumberTaken' }, { status: 409 });
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await logActivity(gate.user, 'update', 'letter', `${number} – ${content.subject}`, id);
        return NextResponse.json(await load(id));
    }

    if (body.action === 'status') {
        const allowed: Record<string, string[]> = { draft: ['sent', 'cancelled'], sent: ['cancelled'], cancelled: ['draft'] };
        const status = String(body.status);
        if (!allowed[letter.status]?.includes(status)) return NextResponse.json({ error: 'BadStatus' }, { status: 400 });
        const { error } = await supabaseAdmin.from('company_letters').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await logActivity(gate.user, status === 'sent' ? 'send' : status === 'cancelled' ? 'cancel' : 'restore', 'letter', letter.letter_number, id);
        return NextResponse.json(await load(id));
    }

    if (body.action === 'duplicate') {
        const date = new Date().toISOString().slice(0, 10);
        const number = await nextNumber('company_letters', 'letter_number', 'L', date);
        const copy = letterContent({ ...letter, date });
        const { data, error } = await supabaseAdmin
            .from('company_letters')
            .insert({ ...copy, letter_number: number, status: 'draft', created_by: gate.user.email })
            .select('id, letter_number')
            .single();
        if (error || !data) return NextResponse.json({ error: error?.message ?? 'Insert' }, { status: 500 });
        await logActivity(gate.user, 'create', 'letter', `${number} (copie de ${letter.letter_number})`, data.id);
        return NextResponse.json(data);
    }

    return NextResponse.json({ error: 'BadAction' }, { status: 400 });
}
