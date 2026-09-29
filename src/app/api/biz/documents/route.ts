import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { DOC_TYPES, readJson, type DocType } from '@/lib/biz';
import { DocumentError, createDocument } from '@/lib/documents';

export const dynamic = 'force-dynamic';

const LIST_FIELDS =
    'id, invoice_number, type, date, due_date, status, subtotal_ht, tva_rate, tva_amount, total_ttc, paid_amount, paid_at, party:parties(id, name)';

// Invoices and quotes
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const type = new URL(request.url).searchParams.get('type');
    let query = supabaseAdmin.from('accounting_invoices').select(LIST_FIELDS).order('date', { ascending: false }).order('invoice_number', { ascending: false });
    if (type && DOC_TYPES.includes(type as DocType)) query = query.eq('type', type);
    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });

    try {
        const doc = await createDocument(gate.user, body);
        return NextResponse.json({ id: doc.id, invoice_number: doc.invoice_number });
    } catch (e) {
        if (e instanceof DocumentError && e.code !== 'Failed') return NextResponse.json({ error: e.code }, { status: e.code === 'NumberTaken' ? 409 : 400 });
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}
