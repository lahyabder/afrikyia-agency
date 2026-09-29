import { NextResponse } from 'next/server';
import { getSessionUser, requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { readJson } from '@/lib/biz';
import { loadCompany, saveCompany } from '@/lib/companyStore';

export const dynamic = 'force-dynamic';

// Any signed-in team member can read it (it is printed on their documents)
export async function GET(request: Request) {
    if (!(await getSessionUser(request))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    return NextResponse.json(await loadCompany());
}

// Only administrators change it
export async function PUT(request: Request) {
    const gate = await requireAccess(request, 'users');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    if (!body) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    try {
        const saved = await saveCompany(body.company, (body.bank as Record<string, string>) ?? null);
        await logActivity(gate.user, 'update', 'company');
        return NextResponse.json(saved);
    } catch (e) {
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 });
    }
}
