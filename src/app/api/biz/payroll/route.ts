import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { isoDate, money, readJson, text } from '@/lib/biz';
import { computeSlip, normalizeRates } from '@/lib/payroll';
import { loadRates } from '@/lib/payrollStore';

export const dynamic = 'force-dynamic';

const FIELDS = '*, employee:employees(id, matricule, full_name, full_name_ar, position)';

function period(body: Record<string, unknown> | null, url?: URL) {
    const y = Number(body?.year ?? url?.searchParams.get('year'));
    const m = Number(body?.month ?? url?.searchParams.get('month'));
    return y >= 2000 && y <= 2100 && m >= 1 && m <= 12 ? { year: y, month: m } : null;
}

// Payslips of one month
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const p = period(null, new URL(request.url));
    if (!p) return NextResponse.json({ error: 'BadPeriod' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('pay_slips').select(FIELDS).eq('period_year', p.year).eq('period_month', p.month);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

// Prepare the month's payslips for every active employee who has none yet
export async function POST(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const p = period(await readJson(request));
    if (!p) return NextResponse.json({ error: 'BadPeriod' }, { status: 400 });

    const [{ data: employees, error }, { data: existing }, rates] = await Promise.all([
        supabaseAdmin.from('employees').select('id, salary_brut').eq('is_active', true),
        supabaseAdmin.from('pay_slips').select('employee_id').eq('period_year', p.year).eq('period_month', p.month),
        loadRates(),
    ]);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const done = new Set((existing ?? []).map(s => s.employee_id));
    const rows = (employees ?? [])
        .filter(e => !done.has(e.id))
        .map(e => {
            const c = computeSlip(money(e.salary_brut), 0, 0, rates);
            return {
                employee_id: e.id,
                period_year: p.year,
                period_month: p.month,
                salary_brut: money(e.salary_brut),
                bonus: 0,
                deductions: 0,
                cnss_sal: c.cnss_sal,
                cnss_pat: c.cnss_pat,
                cnam_sal: c.cnam_sal,
                cnam_pat: c.cnam_pat,
                taxable_base: c.taxable_base,
                its: c.its,
                net_paye: c.net_paye,
                rates,
                is_paid: false,
            };
        });
    if (rows.length) {
        const { error: insertError } = await supabaseAdmin.from('pay_slips').insert(rows);
        if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    if (rows.length) await logActivity(gate.user, 'prepare', 'payroll', `${p.year}-${String(p.month).padStart(2, '0')}: ${rows.length}`);
    return NextResponse.json({ created: rows.length });
}

// Change bonus/deductions (recalculated), or mark as paid / unpaid
export async function PATCH(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const id = text(body?.id, 64);
    if (!body || !id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { data: slip } = await supabaseAdmin.from('pay_slips').select('*').eq('id', id).single();
    if (!slip) return NextResponse.json({ error: 'NotFound' }, { status: 404 });

    let update: Record<string, unknown>;
    if (body.action === 'pay') {
        update = { is_paid: true, paid_at: isoDate(body.paid_at) ?? new Date().toISOString().slice(0, 10) };
    } else if (body.action === 'unpay') {
        update = { is_paid: false, paid_at: null };
    } else {
        if (slip.is_paid) return NextResponse.json({ error: 'AlreadyPaid' }, { status: 409 });
        // Recalculate with the current rates and the employee's salary on the slip
        const rates = body.recalculate ? await loadRates() : slip.rates ? normalizeRates(slip.rates) : await loadRates();
        let salary = money(slip.salary_brut);
        if (body.recalculate) {
            // Also take the employee's current salary
            const { data: emp } = await supabaseAdmin.from('employees').select('salary_brut').eq('id', slip.employee_id).single();
            if (emp) salary = money(emp.salary_brut);
        }
        const bonus = money(body.bonus ?? slip.bonus);
        const deductions = money(body.deductions ?? slip.deductions);
        const c = computeSlip(salary, bonus, deductions, rates);
        update = {
            salary_brut: salary,
            bonus,
            deductions,
            cnss_sal: c.cnss_sal,
            cnss_pat: c.cnss_pat,
            cnam_sal: c.cnam_sal,
            cnam_pat: c.cnam_pat,
            taxable_base: c.taxable_base,
            its: c.its,
            net_paye: c.net_paye,
            rates,
            notes: body.notes !== undefined ? text(body.notes, 1000) : slip.notes,
        };
    }
    const { data, error } = await supabaseAdmin.from('pay_slips').update(update).eq('id', id).select(FIELDS).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const period = `${slip.period_year}-${String(slip.period_month).padStart(2, '0')}`;
    await logActivity(gate.user, typeof body.action === 'string' ? body.action : 'update', 'payslip', `${period} ${data.employee?.full_name ?? ''}`.trim(), id);
    return NextResponse.json(data);
}

// Only a slip that was not paid can be removed (to prepare it again)
export async function DELETE(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { data: slip } = await supabaseAdmin.from('pay_slips').select('is_paid').eq('id', id).single();
    if (!slip) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    if (slip.is_paid) return NextResponse.json({ error: 'AlreadyPaid' }, { status: 409 });
    const { error } = await supabaseAdmin.from('pay_slips').delete().eq('id', id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'delete', 'payslip', null, id);
    return NextResponse.json({ success: true });
}
