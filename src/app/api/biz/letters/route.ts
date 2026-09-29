import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { readJson } from '@/lib/biz';
import { LetterError, createLetter } from '@/lib/letters';

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
    try {
        return NextResponse.json(await createLetter(gate.user, body));
    } catch (e) {
        const code = e instanceof LetterError ? e.code : 'Failed';
        return NextResponse.json({ error: code === 'Failed' && e instanceof Error ? e.message : code }, { status: code === 'NumberTaken' ? 409 : code === 'MissingFields' ? 400 : 500 });
    }
}
