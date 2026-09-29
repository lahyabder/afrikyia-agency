// Financial figures shared by the finance page and the dashboard assistant, so both always show the same numbers.
import { supabaseAdmin } from '@/lib/supabase';
import { money } from '@/lib/biz';

// Money in (payments received), money out (expenses and paid salaries) and what clients still owe, for one year
export async function financialSummary(year: number) {
    const from = `${year}-01-01`;
    const to = `${year}-12-31`;

    const [paidRes, expRes, openRes, slipsRes] = await Promise.all([
        supabaseAdmin.from('accounting_invoices').select('paid_amount, paid_at').eq('type', 'invoice').gt('paid_amount', 0).gte('paid_at', from).lte('paid_at', to),
        supabaseAdmin.from('accounting_expenses').select('amount_ttc, date, category').gte('date', from).lte('date', to),
        supabaseAdmin
            .from('accounting_invoices')
            .select('id, invoice_number, date, due_date, status, total_ttc, paid_amount, withheld_amount, party:parties(name)')
            .eq('type', 'invoice')
            .in('status', ['draft', 'sent', 'overdue'])
            .order('date'),
        supabaseAdmin.from('pay_slips').select('salary_brut, bonus, cnss_pat, cnam_pat, paid_at, period_year, period_month').eq('is_paid', true),
    ]);
    const error = paidRes.error || expRes.error || openRes.error || slipsRes.error;
    if (error) throw new Error(error.message);

    const months = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expenses: 0 }));
    for (const r of paidRes.data ?? []) months[Number(r.paid_at.slice(5, 7)) - 1].income += money(r.paid_amount);
    const byCategory: Record<string, number> = {};
    for (const r of expRes.data ?? []) {
        months[Number(r.date.slice(5, 7)) - 1].expenses += money(r.amount_ttc);
        byCategory[r.category || 'other'] = money((byCategory[r.category || 'other'] ?? 0) + money(r.amount_ttc));
    }
    // Paid salaries count at their full cost to the company (gross + employer contributions)
    for (const s of slipsRes.data ?? []) {
        const day = s.paid_at || `${s.period_year}-${String(s.period_month).padStart(2, '0')}-28`;
        if (day < from || day > to) continue;
        const cost = money(money(s.salary_brut) + money(s.bonus) + money(s.cnss_pat) + money(s.cnam_pat));
        months[Number(day.slice(5, 7)) - 1].expenses += cost;
        byCategory.salaries = money((byCategory.salaries ?? 0) + cost);
    }
    const income = money(months.reduce((s, m) => s + m.income, 0));
    const expenses = money(months.reduce((s, m) => s + m.expenses, 0));
    const today = new Date().toISOString().slice(0, 10);
    const open = (openRes.data ?? [])
        .map(r => ({ ...r, due: money(money(r.total_ttc) - money(r.paid_amount) - money(r.withheld_amount)), late: !!r.due_date && r.due_date < today }))
        .filter(r => r.due > 0);

    return {
        year,
        income,
        expenses,
        net: money(income - expenses),
        receivable: money(open.reduce((s, r) => s + r.due, 0)),
        months: months.map(m => ({ ...m, income: money(m.income), expenses: money(m.expenses) })),
        byCategory,
        open,
    };
}
