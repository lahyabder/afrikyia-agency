import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { DOC_TYPES, fiscalYearFor, isoDate, money, nextNumber, parseLines, readJson, text, totals, type DocType } from '@/lib/biz';

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

    const type: DocType = body.type === 'quote' ? 'quote' : 'invoice';
    const date = isoDate(body.date) ?? new Date().toISOString().slice(0, 10);
    const lines = parseLines(body.lines);
    const partyId = text(body.party_id, 64);
    if (!partyId || lines.length === 0) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });

    try {
        const fiscalYearId = await fiscalYearFor(date);
        // A number typed by the user (e.g. an older document) is kept as is; otherwise the next one in the series
        const typed = text(body.invoice_number, 60);
        const number = typed ?? await nextNumber('accounting_invoices', 'invoice_number', type === 'quote' ? 'DEV' : 'F', date);
        const { data: doc, error } = await supabaseAdmin
            .from('accounting_invoices')
            .insert({
                invoice_number: number,
                type,
                party_id: partyId,
                fiscal_year_id: fiscalYearId,
                date,
                due_date: isoDate(body.due_date),
                status: 'draft',
                notes: text(body.notes, 2000),
                paid_amount: 0,
                ...totals(lines, money(body.tva_rate)),
            })
            .select('id')
            .single();
        if (error?.code === '23505') return NextResponse.json({ error: 'NumberTaken' }, { status: 409 });
        if (error || !doc) throw new Error(error?.message ?? 'Insert');

        const { error: linesError } = await supabaseAdmin
            .from('accounting_invoice_lines')
            .insert(lines.map((l, i) => ({ ...l, invoice_id: doc.id, tva_rate: money(body.tva_rate), sequence: i + 1 })));
        if (linesError) {
            await supabaseAdmin.from('accounting_invoices').delete().eq('id', doc.id);
            throw new Error(linesError.message);
        }
        await logActivity(gate.user, 'create', type, number, doc.id);
        return NextResponse.json({ id: doc.id, invoice_number: number });
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}
