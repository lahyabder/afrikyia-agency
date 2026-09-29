import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { nextNumber, readJson, text } from '@/lib/biz';
import { letterContent } from '@/lib/letters';

export const dynamic = 'force-dynamic';

const LIST_FIELDS = 'id, letter_number, date, language, recipient, subject, status, party:parties(id, name)';

export async function GET(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const { data, error } = await supabaseAdmin
        .from('company_letters')
        .select(LIST_FIELDS)
        .order('date', { ascending: false })
        .order('letter_number', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// New letter: the next number in the yearly series, or a number typed by the user
export async function POST(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const content = letterContent(body);
    if (!content.subject) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
    const number = text(body.letter_number, 60) ?? (await nextNumber('company_letters', 'letter_number', 'L', content.date));
    const { data, error } = await supabaseAdmin
        .from('company_letters')
        .insert({ ...content, letter_number: number, status: 'draft', created_by: gate.user.email })
        .select('id, letter_number')
        .single();
    if (error?.code === '23505') return NextResponse.json({ error: 'NumberTaken' }, { status: 409 });
    if (error || !data) return NextResponse.json({ error: error?.message ?? 'Insert' }, { status: 500 });
    await logActivity(gate.user, 'create', 'letter', `${number} – ${content.subject}`, data.id);
    return NextResponse.json(data);
}
