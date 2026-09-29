import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/adminAuth';
import { readJson } from '@/lib/biz';
import { loadRates, saveRates } from '@/lib/payrollStore';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    return NextResponse.json(await loadRates());
}

export async function PUT(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    try {
        return NextResponse.json(await saveRates(body));
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}
