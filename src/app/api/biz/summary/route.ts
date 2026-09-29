import { NextResponse } from 'next/server';
import { requireAccess } from '@/lib/adminAuth';
import { financialSummary } from '@/lib/finance';

export const dynamic = 'force-dynamic';

// Money in (payments received), money out (expenses) and what clients still owe
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'finance');
    if (gate.denied) return gate.denied;
    const year = parseInt(new URL(request.url).searchParams.get('year') || '', 10) || new Date().getFullYear();
    try {
        return NextResponse.json(await financialSummary(year));
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}
