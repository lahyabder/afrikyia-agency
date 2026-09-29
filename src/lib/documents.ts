// Creating invoices and quotes, shared by the invoices page and the dashboard assistant
import { supabaseAdmin } from '@/lib/supabase';
import type { SessionUser } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { fiscalYearFor, isoDate, money, nextNumber, parseLines, text, totals, type DocType } from '@/lib/biz';

export class DocumentError extends Error {
    constructor(public code: 'MissingFields' | 'NumberTaken' | 'Failed', message?: string) {
        super(message ?? code);
    }
}

// A new draft invoice or quote with its lines, numbered F/2026/019 or DEV/2026/019 unless a number is typed
export async function createDocument(user: SessionUser, body: Record<string, unknown>, origin = '') {
    const type: DocType = body.type === 'quote' ? 'quote' : 'invoice';
    const date = isoDate(body.date) ?? new Date().toISOString().slice(0, 10);
    const lines = parseLines(body.lines);
    const partyId = text(body.party_id, 64);
    if (!partyId || lines.length === 0) throw new DocumentError('MissingFields');

    const fiscalYearId = await fiscalYearFor(date);
    // A number typed by the user (e.g. an older document) is kept as is; otherwise the next one in the series
    const typed = text(body.invoice_number, 60);
    const number = typed ?? (await nextNumber('accounting_invoices', 'invoice_number', type === 'quote' ? 'DEV' : 'F', date));
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
        .select('id, total_ttc')
        .single();
    if (error?.code === '23505') throw new DocumentError('NumberTaken');
    if (error || !doc) throw new DocumentError('Failed', error?.message ?? 'Insert');

    const { error: linesError } = await supabaseAdmin
        .from('accounting_invoice_lines')
        .insert(lines.map((l, i) => ({ ...l, invoice_id: doc.id, tva_rate: money(body.tva_rate), sequence: i + 1 })));
    if (linesError) {
        await supabaseAdmin.from('accounting_invoices').delete().eq('id', doc.id);
        throw new DocumentError('Failed', linesError.message);
    }
    await logActivity(user, 'create', type, `${number}${origin}`, doc.id);
    return { id: doc.id as string, invoice_number: number, type, total_ttc: money(doc.total_ttc) };
}
