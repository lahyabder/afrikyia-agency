import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { DOC_STATUSES, PAYMENT_METHODS, fiscalYearFor, isoDate, money, nextNumber, parseLines, readJson, text, totals } from '@/lib/biz';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

async function load(id: string) {
    const { data, error } = await supabaseAdmin
        .from('accounting_invoices')
        .select('*, party:parties(id, name, nif, rc, address, phone, email), lines:accounting_invoice_lines(id, description, quantity, unit_price, total_ht, sequence)')
        .eq('id', id)
        .single();
    if (error || !data) return null;
    data.lines = (data.lines ?? []).sort((a: { sequence: number }, b: { sequence: number }) => (a.sequence ?? 0) - (b.sequence ?? 0));
    return data;
}

export async function GET(request: Request, { params }: Params) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const { id } = await params;
    const doc = await load(id);
    if (!doc) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    // Bank details printed on the document
    const { data: banks } = await supabaseAdmin.from('bank_accounts').select('bank_name, account_number, rib, iban, swift, holder, agency').eq('is_active', true).limit(1);
    return NextResponse.json({ ...doc, banks: banks ?? [] });
}

// Edit content, change status, record a payment, or turn a quote into an invoice
export async function PATCH(request: Request, { params }: Params) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const { id } = await params;
    const body = await readJson(request);
    const doc = await load(id);
    if (!body || !doc) return NextResponse.json({ error: 'NotFound' }, { status: 404 });

    const action = body.action;

    if (action === 'convert') {
        if (doc.type !== 'quote') return NextResponse.json({ error: 'NotAQuote' }, { status: 400 });
        const date = new Date().toISOString().slice(0, 10);
        const number = await nextNumber('accounting_invoices', 'invoice_number', 'F', date);
        const { data: created, error } = await supabaseAdmin
            .from('accounting_invoices')
            .insert({
                invoice_number: number,
                type: 'invoice',
                party_id: doc.party_id,
                project_id: doc.project_id,
                fiscal_year_id: await fiscalYearFor(date),
                date,
                status: 'draft',
                subtotal_ht: doc.subtotal_ht,
                tva_rate: doc.tva_rate,
                tva_amount: doc.tva_amount,
                total_ttc: doc.total_ttc,
                paid_amount: 0,
                notes: [doc.notes, `Devis ${doc.invoice_number}`].filter(Boolean).join('\n'),
            })
            .select('id')
            .single();
        if (error || !created) return NextResponse.json({ error: error?.message }, { status: 500 });
        await supabaseAdmin.from('accounting_invoice_lines').insert(
            doc.lines.map((l: { description: string; quantity: number; unit_price: number; sequence: number }) => ({
                invoice_id: created.id,
                description: l.description,
                quantity: l.quantity,
                unit_price: l.unit_price,
                tva_rate: doc.tva_rate,
                sequence: l.sequence,
            }))
        );
        // The quote keeps a note of the invoice it became
        await supabaseAdmin
            .from('accounting_invoices')
            .update({ notes: [doc.notes, `Facture ${number}`].filter(Boolean).join('\n'), updated_at: new Date().toISOString() })
            .eq('id', id);
        await logActivity(gate.user, 'convert', 'quote', `${doc.invoice_number} → ${number}`, id);
        return NextResponse.json({ id: created.id, invoice_number: number });
    }

    if (action === 'pay') {
        const amount = money(body.amount) || money(doc.total_ttc) - money(doc.paid_amount);
        const paid = money(money(doc.paid_amount) + amount);
        const method = PAYMENT_METHODS.includes(body.payment_method as (typeof PAYMENT_METHODS)[number]) ? body.payment_method : 'bank';
        const { error } = await supabaseAdmin
            .from('accounting_invoices')
            .update({
                paid_amount: paid,
                paid_at: isoDate(body.paid_at) ?? new Date().toISOString().slice(0, 10),
                payment_method: method,
                status: paid >= money(doc.total_ttc) ? 'paid' : doc.status === 'draft' ? 'sent' : doc.status,
                updated_at: new Date().toISOString(),
            })
            .eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await logActivity(gate.user, 'pay', doc.type, `${doc.invoice_number}: ${amount}`, id);
        return NextResponse.json(await load(id));
    }

    if (action === 'status') {
        const status = body.status as string;
        if (!DOC_STATUSES.includes(status as (typeof DOC_STATUSES)[number])) return NextResponse.json({ error: 'BadStatus' }, { status: 400 });
        const { error } = await supabaseAdmin.from('accounting_invoices').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        await logActivity(gate.user, `status:${status}`, doc.type, doc.invoice_number, id);
        return NextResponse.json(await load(id));
    }

    // Full edit (only while nothing has been paid)
    if (money(doc.paid_amount) > 0) return NextResponse.json({ error: 'AlreadyPaid' }, { status: 409 });
    const lines = parseLines(body.lines);
    const partyId = text(body.party_id, 64);
    if (!partyId || lines.length === 0) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
    const date = isoDate(body.date) ?? doc.date;
    const { error } = await supabaseAdmin
        .from('accounting_invoices')
        .update({
            party_id: partyId,
            date,
            fiscal_year_id: await fiscalYearFor(date),
            due_date: isoDate(body.due_date),
            notes: text(body.notes, 2000),
            invoice_number: text(body.invoice_number, 60) ?? doc.invoice_number,
            updated_at: new Date().toISOString(),
            ...totals(lines, money(body.tva_rate)),
        })
        .eq('id', id);
    if (error?.code === '23505') return NextResponse.json({ error: 'NumberTaken' }, { status: 409 });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await supabaseAdmin.from('accounting_invoice_lines').delete().eq('invoice_id', id);
    const { error: linesError } = await supabaseAdmin
        .from('accounting_invoice_lines')
        .insert(lines.map((l, i) => ({ ...l, invoice_id: id, tva_rate: money(body.tva_rate), sequence: i + 1 })));
    if (linesError) return NextResponse.json({ error: linesError.message }, { status: 500 });
    await logActivity(gate.user, 'update', doc.type, doc.invoice_number, id);
    return NextResponse.json(await load(id));
}

export async function DELETE(request: Request, { params }: Params) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const { id } = await params;
    const doc = await load(id);
    if (!doc) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    // An invoice that was sent or paid is cancelled, never erased
    if (doc.type === 'invoice' && doc.status !== 'draft') return NextResponse.json({ error: 'CancelInstead' }, { status: 409 });
    const { error } = await supabaseAdmin.from('accounting_invoices').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'delete', doc.type, doc.invoice_number, id);
    return NextResponse.json({ success: true });
}
