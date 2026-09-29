// Server helpers for the company tools (clients, invoices, quotes, expenses).
// They read and write the accounting tables through the website server only.
import { supabaseAdmin } from '@/lib/supabase';

export const DOC_TYPES = ['invoice', 'quote'] as const;
export type DocType = (typeof DOC_TYPES)[number];
export const DOC_STATUSES = ['draft', 'sent', 'paid', 'overdue', 'cancelled'] as const;
export const PARTY_TYPES = ['client', 'supplier', 'both'] as const;
export const PAYMENT_METHODS = ['cash', 'bank', 'bankily', 'masrvi', 'sedad', 'cheque', 'other'] as const;

// Simple spending categories, each booked on an account of the chart of accounts
export const EXPENSE_CATEGORIES: Record<string, string> = {
    hosting: '627',
    software: '628',
    telecom: '626',
    rent: '622',
    utilities: '606',
    transport: '618',
    marketing: '625',
    fees: '632',
    bank: '631',
    supplies: '604',
    subcontracting: '621',
    training: '633',
    salaries: '641',
    equipment: '241', // investment: computers, furniture
    other: '65',
};

export function money(value: unknown): number {
    const n = typeof value === 'number' ? value : parseFloat(String(value ?? '').replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

export function text(value: unknown, max = 500): string | null {
    if (typeof value !== 'string') return null;
    const v = value.trim().slice(0, max);
    return v || null;
}

export function isoDate(value: unknown): string | null {
    return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : null;
}

// The open fiscal year that contains the date; created on first use of a new year.
export async function fiscalYearFor(date: string): Promise<string> {
    const { data } = await supabaseAdmin
        .from('fiscal_years')
        .select('id')
        .lte('start_date', date)
        .gte('end_date', date)
        .order('created_at', { ascending: true })
        .limit(1);
    if (data && data[0]) return data[0].id;
    const year = date.slice(0, 4);
    const { data: created, error } = await supabaseAdmin
        .from('fiscal_years')
        .insert({ label: `Exercice ${year}`, start_date: `${year}-01-01`, end_date: `${year}-12-31`, is_closed: false })
        .select('id')
        .single();
    if (error || !created) throw new Error('FiscalYear');
    return created.id;
}

// Next number in a yearly series, following the company's format: F/2026/019, DEV/2026/019, DEP/2026/016
export async function nextNumber(table: string, column: string, prefix: string, date: string): Promise<string> {
    const base = `${prefix}/${date.slice(0, 4)}/`;
    const { data } = await supabaseAdmin.from(table).select(column).like(column, `${base}%`);
    let max = 0;
    for (const row of (data ?? []) as unknown as Record<string, string>[]) {
        const n = parseInt(String(row[column]).slice(base.length), 10);
        if (Number.isFinite(n) && n > max) max = n;
    }
    return `${base}${String(max + 1).padStart(3, '0')}`;
}

export async function accountIdForCategory(category: string): Promise<string | null> {
    const code = EXPENSE_CATEGORIES[category] ?? EXPENSE_CATEGORIES.other;
    const { data } = await supabaseAdmin.from('accounts').select('id').eq('code', code).limit(1);
    if (data && data[0]) return data[0].id;
    const { data: any6 } = await supabaseAdmin.from('accounts').select('id').eq('class', 6).eq('is_detail', true).limit(1);
    return any6?.[0]?.id ?? null;
}

export type LineInput = { description: string; quantity: number; unit_price: number };

export function parseLines(value: unknown): LineInput[] {
    if (!Array.isArray(value)) return [];
    return value
        .map(l => ({
            description: text((l as Record<string, unknown>)?.description, 1000) ?? '',
            quantity: money((l as Record<string, unknown>)?.quantity) || 0,
            unit_price: money((l as Record<string, unknown>)?.unit_price),
        }))
        .filter(l => l.description && l.quantity > 0)
        .slice(0, 100);
}

export function totals(lines: LineInput[], tvaRate: number) {
    const subtotal = money(lines.reduce((s, l) => s + l.quantity * l.unit_price, 0));
    const tva = money((subtotal * tvaRate) / 100);
    return { subtotal_ht: subtotal, tva_rate: tvaRate, tva_amount: tva, total_ttc: money(subtotal + tva) };
}

export async function readJson(request: Request): Promise<Record<string, unknown> | null> {
    try {
        const body = await request.json();
        return body && typeof body === 'object' ? body : null;
    } catch {
        return null;
    }
}
