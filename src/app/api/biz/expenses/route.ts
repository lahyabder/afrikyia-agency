import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS, accountIdForCategory, fiscalYearFor, isoDate, money, nextNumber, readJson, text } from '@/lib/biz';

export const dynamic = 'force-dynamic';

const FIELDS = 'id, expense_number, date, description, category, amount_ht, tva_rate, tva_amount, amount_ttc, payment_method, notes, party:parties(id, name)';

async function expenseFields(body: Record<string, unknown>) {
    const date = isoDate(body.date) ?? new Date().toISOString().slice(0, 10);
    const category = typeof body.category === 'string' && body.category in EXPENSE_CATEGORIES ? body.category : 'other';
    const amount = money(body.amount_ttc);
    const tvaRate = money(body.tva_rate);
    const ht = money(amount / (1 + tvaRate / 100));
    const method = PAYMENT_METHODS.includes(body.payment_method as (typeof PAYMENT_METHODS)[number]) ? body.payment_method : 'cash';
    return {
        date,
        category,
        description: text(body.description, 500),
        party_id: text(body.party_id, 64),
        amount_ttc: amount,
        tva_rate: tvaRate,
        amount_ht: ht,
        tva_amount: money(amount - ht),
        payment_method: method,
        notes: text(body.notes, 2000),
        account_id: await accountIdForCategory(category),
        fiscal_year_id: await fiscalYearFor(date),
        status: 'approved',
    };
}

export async function GET(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const { data, error } = await supabaseAdmin.from('accounting_expenses').select(FIELDS).order('date', { ascending: false }).order('expense_number', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    try {
        const fields = await expenseFields(body);
        if (!fields.description || fields.amount_ttc <= 0) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
        const expense_number = await nextNumber('accounting_expenses', 'expense_number', 'DEP', fields.date);
        const { data, error } = await supabaseAdmin.from('accounting_expenses').insert({ ...fields, expense_number }).select(FIELDS).single();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const body = await readJson(request);
    const id = text(body?.id, 64);
    if (!body || !id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    try {
        const fields = await expenseFields(body);
        if (!fields.description || fields.amount_ttc <= 0) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
        const { data, error } = await supabaseAdmin.from('accounting_expenses').update(fields).eq('id', id).select(FIELDS).single();
        if (error) throw new Error(error.message);
        return NextResponse.json(data);
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { error } = await supabaseAdmin.from('accounting_expenses').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true });
}
