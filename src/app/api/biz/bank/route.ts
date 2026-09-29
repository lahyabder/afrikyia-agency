import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { EXPENSE_CATEGORIES, accountIdForCategory, fiscalYearFor, isoDate, money, nextNumber, readJson, text } from '@/lib/biz';
import { classify, type StatementLine } from '@/lib/bankStatement';
import { expenseCandidates, invoiceCandidates, suggestExpenses, suggestInvoices } from '@/lib/bankMatch';

export const dynamic = 'force-dynamic';

const TX_FIELDS =
    'id, bank_account_id, date, label, amount, type, reference, category, is_reconciled, payment_added, invoice:accounting_invoices(id, invoice_number), expense:accounting_expenses(id, expense_number, description)';

// Money that is neither a client payment nor an expense
const OTHER_INCOME = ['capital', 'financing', 'other_income'] as const;
const OTHER_OUT = ['cash_withdrawal', 'internal_transfer', 'owner_withdrawal'] as const;

const signed = (t: { type: string; amount: number }) => (t.type === 'income' ? 1 : -1) * money(t.amount);

// Accounts, movements, balance, lines still to match (with suggestions) and the bank balance check
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const [{ data: accounts, error }, { data: tx, error: txError }, invoices, expenses] = await Promise.all([
        supabaseAdmin
            .from('bank_accounts')
            .select('id, bank_name, account_number, rib, iban, swift, holder, agency, is_active, statement_balance, statement_date')
            .eq('is_active', true)
            .order('created_at'),
        supabaseAdmin.from('bank_transactions').select(TX_FIELDS).order('date', { ascending: false }).order('created_at', { ascending: false }),
        invoiceCandidates(),
        expenseCandidates(),
    ]);
    if (error || txError) return NextResponse.json({ error: (error || txError)?.message }, { status: 500 });

    const balances: Record<string, number> = {};
    for (const t of tx ?? []) balances[t.bank_account_id] = money((balances[t.bank_account_id] ?? 0) + signed(t));

    // Balance computed up to the date of the bank's own figure, and the difference
    const checks = (accounts ?? []).map(a => {
        if (a.statement_balance === null || !a.statement_date) return { account_id: a.id, date: null, bank: null, computed: null, difference: null };
        const computed = money((tx ?? []).filter(t => t.bank_account_id === a.id && t.date <= a.statement_date).reduce((s, t) => s + signed(t), 0));
        return { account_id: a.id, date: a.statement_date, bank: money(a.statement_balance), computed, difference: money(money(a.statement_balance) - computed) };
    });

    const pending = (tx ?? [])
        .filter(t => !t.is_reconciled)
        .map(t => ({
            ...t,
            suggestions: {
                invoices: t.type === 'income' ? suggestInvoices(money(t.amount), invoices) : [],
                expenses: t.type !== 'income' ? suggestExpenses(money(t.amount), t.date, expenses) : [],
            },
        }));

    return NextResponse.json({ accounts: accounts ?? [], transactions: tx ?? [], balances, checks, pending, openInvoices: invoices, freeExpenses: expenses });
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

        let dup = supabaseAdmin.from('bank_transactions').select('id', { count: 'exact', head: true }).eq('bank_account_id', accountId).eq('date', date).eq('amount', amount);
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
            // Only bank fees are settled automatically; everything else waits for a match
            is_reconciled: kind === 'fee',
        });
        if (error) return NextResponse.json({ error: error.message, imported }, { status: 500 });
        imported++;
    }
    if (imported) await logActivity(gate.user, 'import', 'bank_statement', `${imported} / ${lines.length}`);
    return NextResponse.json({ imported, skipped, fees });
}

async function recomputeInvoiceStatus(invoiceId: string, paid: number) {
    const { data: inv } = await supabaseAdmin.from('accounting_invoices').select('total_ttc, withheld_amount, status').eq('id', invoiceId).single();
    if (!inv) return;
    const settled = paid + money(inv.withheld_amount) >= money(inv.total_ttc);
    const status = settled ? 'paid' : inv.status === 'paid' ? 'sent' : inv.status === 'draft' ? 'sent' : inv.status;
    return status;
}

// Match one bank line: to an invoice, to an expense (existing or new), or as another kind of movement
export async function PATCH(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const id = text(body?.id, 64);
    if (!body || !id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { data: tx } = await supabaseAdmin.from('bank_transactions').select('*').eq('id', id).single();
    if (!tx) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    const amount = money(tx.amount);
    const action = body.action;

    if (tx.is_reconciled && action !== 'unlink') return NextResponse.json({ error: 'AlreadyMatched' }, { status: 409 });

    if (action === 'invoice') {
        if (tx.type !== 'income') return NextResponse.json({ error: 'NotIncome' }, { status: 400 });
        const invoiceId = text(body.invoice_id, 64);
        const { data: inv } = await supabaseAdmin.from('accounting_invoices').select('id, invoice_number, total_ttc, paid_amount, withheld_amount').eq('id', invoiceId ?? '').single();
        if (!inv) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
        // "existing": the payment was already typed on the invoice; only tie it to this bank line
        const addPayment = body.mode !== 'existing';
        if (addPayment) {
            const paid = money(money(inv.paid_amount) + amount);
            const status = await recomputeInvoiceStatus(inv.id, paid);
            await supabaseAdmin.from('accounting_invoices').update({ paid_amount: paid, paid_at: tx.date, payment_method: 'bank', status }).eq('id', inv.id);
        }
        await supabaseAdmin.from('bank_transactions').update({ invoice_id: inv.id, category: 'client_payment', is_reconciled: true, payment_added: addPayment }).eq('id', id);
        await logActivity(gate.user, 'match', 'bank_line', `${tx.label} ${amount} → ${inv.invoice_number}`, id);
        return NextResponse.json({ success: true });
    }

    if (action === 'expense') {
        if (tx.type === 'income') return NextResponse.json({ error: 'NotExpense' }, { status: 400 });
        let expenseId = text(body.expense_id, 64);
        if (!expenseId) {
            // Create the expense from the bank line
            const category = typeof body.category === 'string' && body.category in EXPENSE_CATEGORIES ? body.category : 'other';
            const { data: exp, error } = await supabaseAdmin
                .from('accounting_expenses')
                .insert({
                    expense_number: await nextNumber('accounting_expenses', 'expense_number', 'DEP', tx.date),
                    fiscal_year_id: await fiscalYearFor(tx.date),
                    account_id: await accountIdForCategory(category),
                    date: tx.date,
                    description: text(body.description, 500) ?? tx.label,
                    category,
                    party_id: text(body.party_id, 64),
                    amount_ht: amount,
                    tva_rate: 0,
                    tva_amount: 0,
                    amount_ttc: amount,
                    payment_method: body.cash ? 'cash' : 'bank',
                    status: 'approved',
                    notes: tx.reference ? `Relevé bancaire, réf. ${tx.reference}` : 'Relevé bancaire',
                })
                .select('id')
                .single();
            if (error || !exp) return NextResponse.json({ error: error?.message }, { status: 500 });
            expenseId = exp.id;
        }
        const { data: exp } = await supabaseAdmin.from('accounting_expenses').select('expense_number, category').eq('id', expenseId).single();
        await supabaseAdmin.from('bank_transactions').update({ expense_id: expenseId, type: tx.type === 'fee' ? 'fee' : 'expense', category: exp?.category ?? 'other', is_reconciled: true }).eq('id', id);
        await logActivity(gate.user, 'match', 'bank_line', `${tx.label} ${amount} → ${exp?.expense_number ?? ''}`, id);
        return NextResponse.json({ success: true });
    }

    if (action === 'other') {
        const allowed: readonly string[] = tx.type === 'income' ? OTHER_INCOME : OTHER_OUT;
        const category = typeof body.category === 'string' && allowed.includes(body.category) ? body.category : null;
        if (!category) return NextResponse.json({ error: 'BadCategory' }, { status: 400 });
        await supabaseAdmin
            .from('bank_transactions')
            .update({ category, type: tx.type === 'income' ? 'income' : 'transfer', is_reconciled: true })
            .eq('id', id);
        await logActivity(gate.user, 'match', 'bank_line', `${tx.label} ${amount} → ${category}`, id);
        return NextResponse.json({ success: true });
    }

    if (action === 'unlink') {
        if (tx.invoice_id && tx.payment_added) {
            // Take back the payment this link had recorded on the invoice
            const { data: inv } = await supabaseAdmin.from('accounting_invoices').select('paid_amount').eq('id', tx.invoice_id).single();
            if (inv) {
                const paid = Math.max(0, money(money(inv.paid_amount) - amount));
                await supabaseAdmin.from('accounting_invoices').update({ paid_amount: paid, status: await recomputeInvoiceStatus(tx.invoice_id, paid) }).eq('id', tx.invoice_id);
            }
        }
        // Bank fee expenses were created by the import itself; they stay linked
        if (tx.type === 'fee') return NextResponse.json({ error: 'FeeLine' }, { status: 409 });
        await supabaseAdmin
            .from('bank_transactions')
            .update({ invoice_id: null, expense_id: null, payment_added: false, is_reconciled: false, type: tx.type === 'income' ? 'income' : 'expense' })
            .eq('id', id);
        await logActivity(gate.user, 'unmatch', 'bank_line', `${tx.label} ${amount}`, id);
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'BadAction' }, { status: 400 });
}

// The bank's own balance at a date (from the statement), to check that nothing is missing
export async function PUT(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const accountId = text(body?.bank_account_id, 64);
    const date = isoDate(body?.date);
    if (!accountId || !date || body?.balance === undefined || body?.balance === '') return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const balance = parseFloat(String(body.balance).replace(/\s/g, '').replace(',', '.'));
    if (!Number.isFinite(balance)) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { error } = await supabaseAdmin.from('bank_accounts').update({ statement_balance: balance, statement_date: date }).eq('id', accountId);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'update', 'bank_balance', `${date}: ${balance}`, accountId);
    return NextResponse.json({ success: true });
}
