import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { accountIdForCategory, fiscalYearFor, isoDate, money, nextNumber, readJson, text } from '@/lib/biz';
import { classify, type StatementLine } from '@/lib/bankStatement';

export const dynamic = 'force-dynamic';

// Bank accounts with their movements (newest first) and balance
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const [{ data: accounts, error }, { data: tx, error: txError }] = await Promise.all([
        supabaseAdmin.from('bank_accounts').select('id, bank_name, account_number, rib, iban, swift, holder, agency, is_active').eq('is_active', true).order('created_at'),
        supabaseAdmin
            .from('bank_transactions')
            .select('id, bank_account_id, date, label, amount, type, reference, category, invoice:accounting_invoices(id, invoice_number), expense:accounting_expenses(id, expense_number)')
            .order('date', { ascending: false })
            .order('created_at', { ascending: false }),
    ]);
    if (error || txError) return NextResponse.json({ error: (error || txError)?.message }, { status: 500 });
    const balances: Record<string, number> = {};
    for (const t of tx ?? []) balances[t.bank_account_id] = money((balances[t.bank_account_id] ?? 0) + (t.type === 'income' ? 1 : -1) * money(t.amount));
    return NextResponse.json({ accounts: accounts ?? [], transactions: tx ?? [], balances });
}

// Import statement lines. Lines already imported are skipped; bank fees are also recorded as expenses.
export async function POST(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const accountId = text(body?.bank_account_id, 64);
    const lines = Array.isArray(body?.lines) ? (body.lines as StatementLine[]).slice(0, 2000) : [];
    if (!accountId || lines.length === 0) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });

    let imported = 0;
    let skipped = 0;
    let fees = 0;
    for (const raw of lines) {
        const date = isoDate(raw.date);
        const amount = money(raw.amount);
        const label = text(raw.label, 200) ?? '';
        const reference = text(raw.reference, 80);
        if (!date || !amount) continue;
        const { kind, category } = classify({ ...raw, date, amount, label, reference: reference ?? '' });

        let dup = supabaseAdmin.from('bank_transactions').select('id', { count: 'exact', head: true }).eq('bank_account_id', accountId).eq('date', date).eq('amount', amount).eq('type', kind);
        dup = reference ? dup.eq('reference', reference) : dup.eq('label', label);
        const { count } = await dup;
        if ((count ?? 0) > 0) {
            skipped++;
            continue;
        }

        let expenseId: string | null = null;
        if (kind === 'fee') {
            const { data: exp } = await supabaseAdmin
                .from('accounting_expenses')
                .insert({
                    expense_number: await nextNumber('accounting_expenses', 'expense_number', 'DEP', date),
                    fiscal_year_id: await fiscalYearFor(date),
                    account_id: await accountIdForCategory('bank'),
                    date,
                    description: `Banque – ${label}`,
                    category: 'bank',
                    amount_ht: amount,
                    tva_rate: 0,
                    tva_amount: 0,
                    amount_ttc: amount,
                    payment_method: 'bank',
                    status: 'approved',
                    notes: reference ? `Relevé bancaire, réf. ${reference}` : 'Relevé bancaire',
                })
                .select('id')
                .single();
            expenseId = exp?.id ?? null;
            fees++;
        }
        const { error } = await supabaseAdmin.from('bank_transactions').insert({
            bank_account_id: accountId,
            date,
            label,
            amount,
            type: kind,
            reference,
            category,
            expense_id: expenseId,
            is_reconciled: kind !== 'income' && kind !== 'expense',
        });
        if (error) return NextResponse.json({ error: error.message, imported }, { status: 500 });
        imported++;
    }
    if (imported) await logActivity(gate.user, 'import', 'bank_statement', `${imported} / ${lines.length}`);
    return NextResponse.json({ imported, skipped, fees });
}
