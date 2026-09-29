import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { isoDate, money, readJson, text } from '@/lib/biz';

export const dynamic = 'force-dynamic';

// Employee records are never deleted: people who leave are marked inactive.

function employeeFields(body: Record<string, unknown>) {
    return {
        full_name: text(body.full_name, 200),
        full_name_ar: text(body.full_name_ar, 200),
        position: text(body.position, 200),
        department: text(body.department, 200),
        salary_brut: money(body.salary_brut),
        contract_type: text(body.contract_type, 30),
        hire_date: isoDate(body.hire_date),
        phone: text(body.phone, 50),
        email: text(body.email, 200),
        address: text(body.address, 500),
        national_id: text(body.national_id, 50),
        cnss_number: text(body.cnss_number, 50),
        bank_name: text(body.bank_name, 100),
        bank_rib: text(body.bank_rib, 60),
        notes: text(body.notes, 2000),
        is_active: body.is_active !== false,
    };
}

export async function GET(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const { data, error } = await supabaseAdmin.from('employees').select('*').order('matricule');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const fields = body && employeeFields(body);
    if (!fields?.full_name || !fields.position) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
    const { data: all } = await supabaseAdmin.from('employees').select('matricule');
    const max = Math.max(0, ...(all ?? []).map(e => parseInt(String(e.matricule).replace(/\D/g, ''), 10) || 0));
    const matricule = `EMP-${String(max + 1).padStart(3, '0')}`;
    const { data, error } = await supabaseAdmin.from('employees').insert({ ...fields, matricule }).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'create', 'employee', `${data.matricule} ${data.full_name}`, data.id);
    return NextResponse.json(data);
}

export async function PATCH(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const id = text(body?.id, 64);
    const fields = body && employeeFields(body);
    if (!id || !fields?.full_name || !fields.position) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
    const { data, error } = await supabaseAdmin.from('employees').update(fields).eq('id', id).select('*').single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'update', 'employee', `${data.matricule} ${data.full_name}`, data.id);
    return NextResponse.json(data);
}
