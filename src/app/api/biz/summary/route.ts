import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';
import { money } from '@/lib/biz';

export const dynamic = 'force-dynamic';

// Money in (payments received), money out (expenses) and what clients still owe
export async function GET(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const year = parseInt(new URL(request.url).searchParams.get('year') || '', 10) || new Date().getFullYear();
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;

    const [paidRes, expRes, openRes] = await Promise.all([
        supabaseAdmin.from('accounting_invoices').select('paid_amount, paid_at').eq('type', 'invoice').gt('paid_amount', 0).gte('paid_at', from).lte('paid_at', to),
        supabaseAdmin.from('accounting_expenses').select('amount_ttc, date, category').gte('date', from).lte('date', to),
        supabaseAdmin
            .from('accounting_invoices')
            .select('id, invoice_number, date, due_date, status, total_ttc, paid_amount, party:parties(name)')
            .eq('type', 'invoice')
            .in('status', ['draft', 'sent', 'overdue'])
            .order('date'),
    ]);
    const error = paidRes.error || expRes.error || openRes.error;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expenses: 0 }));
    for (const r of paidRes.data ?? []) months[Number(r.paid_at.slice(5, 7)) - 1].income += money(r.paid_amount);
    const byCategory: Record<string, number> = {};
    for (const r of expRes.data ?? []) {
        months[Number(r.date.slice(5, 7)) - 1].expenses += money(r.amount_ttc);
        byCategory[r.category || 'other'] = money((byCategory[r.category || 'other'] ?? 0) + money(r.amount_ttc));
    }
    const income = money(months.reduce((s, m) => s + m.income, 0));
    const expenses = money(months.reduce((s, m) => s + m.expenses, 0));
    const today = new Date().toISOString().slice(0, 10);
    const open = (openRes.data ?? [])
        .map(r => ({ ...r, due: money(money(r.total_ttc) - money(r.paid_amount)), late: !!r.due_date && r.due_date < today }))
        .filter(r => r.due > 0);

    return NextResponse.json({
        year,
        income,
        expenses,
        net: money(income - expenses),
        receivable: money(open.reduce((s, r) => s + r.due, 0)),
        months: months.map(m => ({ ...m, income: money(m.income), expenses: money(m.expenses) })),
        byCategory,
        open,
    });
}
