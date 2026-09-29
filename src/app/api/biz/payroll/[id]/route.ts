import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// One payslip with everything printed on it
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const { id } = await params;
    const { data, error } = await supabaseAdmin
        .from('pay_slips')
        .select('*, employee:employees(matricule, full_name, full_name_ar, position, department, hire_date, contract_type, cnss_number, national_id, bank_name, bank_rib)')
        .eq('id', id)
        .single();
    if (error || !data) return NextResponse.json({ error: 'NotFound' }, { status: 404 });
    return NextResponse.json(data);
}
