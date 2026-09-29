import { NextResponse } from 'next/server';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { readJson } from '@/lib/biz';
import { loadRates, saveRates } from '@/lib/payrollStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    return NextResponse.json(await loadRates());
}

export async function PUT(request: Request) {
    const gate = await requireAccess(request, 'hr');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    try {
        const rates = await saveRates(body);
        await logActivity(gate.user, 'update', 'payroll_rates');
        return NextResponse.json(rates);
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}
