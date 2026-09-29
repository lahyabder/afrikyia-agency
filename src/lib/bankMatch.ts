import { supabaseAdmin } from '@/lib/supabase';
import { money } from '@/lib/biz';

// What an unmatched bank line could be, so the owner can confirm it in one click.

export type InvoiceCandidate = { id: string; invoice_number: string; party: string | null; remaining: number; unlinkedPaid: number; exact: boolean };
export type ExpenseCandidate = { id: string; expense_number: string; description: string; date: string; amount: number; exact: boolean };

// Open invoices, how much is still due, and how much was recorded as paid by hand without a bank line yet
export async function invoiceCandidates(): Promise<Omit<InvoiceCandidate, 'exact'>[]> {
    const [{ data: invoices }, { data: linked }] = await Promise.all([
        supabaseAdmin
            .from('accounting_invoices')
            .select('id, invoice_number, total_ttc, paid_amount, withheld_amount, status, party:parties(name)')
            .eq('type', 'invoice')
            .neq('status', 'cancelled'),
        supabaseAdmin.from('bank_transactions').select('invoice_id, amount').not('invoice_id', 'is', null),
    ]);
    const linkedByInvoice: Record<string, number> = {};
    for (const l of linked ?? []) linkedByInvoice[l.invoice_id] = money((linkedByInvoice[l.invoice_id] ?? 0) + money(l.amount));
    return (invoices ?? [])
        .map(i => {
            const remaining = money(money(i.total_ttc) - money(i.paid_amount) - money(i.withheld_amount));
            const unlinkedPaid = Math.max(0, money(money(i.paid_amount) - (linkedByInvoice[i.id] ?? 0)));
            const party = (i.party as unknown as { name?: string } | null)?.name ?? null;
            return { id: i.id, invoice_number: i.invoice_number, party, remaining, unlinkedPaid };
        })
        .filter(i => i.remaining > 0 || i.unlinkedPaid > 0);
}

// Expenses not yet tied to a bank line
export async function expenseCandidates(): Promise<Omit<ExpenseCandidate, 'exact'>[]> {
    const [{ data: expenses }, { data: linked }] = await Promise.all([
        supabaseAdmin.from('accounting_expenses').select('id, expense_number, description, date, amount_ttc').order('date', { ascending: false }).limit(500),
        supabaseAdmin.from('bank_transactions').select('expense_id').not('expense_id', 'is', null),
    ]);
    const used = new Set((linked ?? []).map(l => l.expense_id));
    return (expenses ?? [])
        .filter(e => !used.has(e.id))
        .map(e => ({ id: e.id, expense_number: e.expense_number, description: e.description, date: e.date, amount: money(e.amount_ttc) }));
}

const DAY = 24 * 60 * 60 * 1000;

export function suggestInvoices(amount: number, invoices: Omit<InvoiceCandidate, 'exact'>[]): InvoiceCandidate[] {
    return invoices
        .filter(i => Math.abs(i.remaining - amount) < 0.01 || Math.abs(i.unlinkedPaid - amount) < 0.01)
        .map(i => ({ ...i, exact: true }));
}

export function suggestExpenses(amount: number, date: string, expenses: Omit<ExpenseCandidate, 'exact'>[]): ExpenseCandidate[] {
    const t = new Date(date).getTime();
    return expenses
        .filter(e => Math.abs(e.amount - amount) < 0.01 && Math.abs(new Date(e.date).getTime() - t) <= 15 * DAY)
        .map(e => ({ ...e, exact: true }));
}
