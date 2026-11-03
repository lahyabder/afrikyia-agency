import { NextResponse } from 'next/server';
import { getSessionUser, requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import {
    loadSocialAccounts,
    saveSocialAccounts,
    addSocialAccount,
    updateSocialAccount,
    deleteSocialAccount,
} from '@/lib/socialsStore';
import { validateSocialAccount, type SocialAccount } from '@/lib/socials';

export const dynamic = 'force-dynamic';

// GET /api/admin/socials: Return all configured social accounts
export async function GET(request: Request) {
    const user = await getSessionUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const accounts = await loadSocialAccounts();
        return NextResponse.json({ accounts });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to load social accounts' },
            { status: 500 }
        );
    }
}

// POST /api/admin/socials: Add a new social account or batch replace
export async function POST(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'BadRequest: Invalid JSON' }, { status: 400 });
    }

    // Support batch replace if array passed
    if (Array.isArray(body)) {
        try {
            const accounts = await saveSocialAccounts(body);
            await logActivity(gate.user, 'update', 'socials');
            return NextResponse.json({ accounts });
        } catch (e) {
            return NextResponse.json(
                { error: e instanceof Error ? e.message : 'Failed to save accounts' },
                { status: 400 }
            );
        }
    }

    const validation = validateSocialAccount(body);
    if (!validation.valid) {
        return NextResponse.json({ error: 'ValidationError', details: validation.errors }, { status: 400 });
    }

    try {
        const accounts = await addSocialAccount(body);
        await logActivity(gate.user, 'create', 'socials', body.platform);
        return NextResponse.json({ accounts }, { status: 201 });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to add social account' },
            { status: 500 }
        );
    }
}

// PUT /api/admin/socials: Update an account or reorder accounts
export async function PUT(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'BadRequest: Invalid JSON' }, { status: 400 });
    }

    // If an array is passed, update full ordered list
    if (Array.isArray(body)) {
        try {
            const accounts = await saveSocialAccounts(body);
            await logActivity(gate.user, 'update', 'socials');
            return NextResponse.json({ accounts });
        } catch (e) {
            return NextResponse.json(
                { error: e instanceof Error ? e.message : 'Failed to update accounts' },
                { status: 400 }
            );
        }
    }

    const { id, ...updates } = body;
    if (!id || typeof id !== 'string') {
        return NextResponse.json({ error: 'BadRequest: Missing account id' }, { status: 400 });
    }

    try {
        const accounts = await updateSocialAccount(id, updates);
        await logActivity(gate.user, 'update', 'socials', id);
        return NextResponse.json({ accounts });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to update account' },
            { status: 400 }
        );
    }
}

// DELETE /api/admin/socials: Delete an account by ID
export async function DELETE(request: Request) {
    const gate = await requireAccess(request, 'publishing');
    if (gate.denied) return gate.denied;

    const url = new URL(request.url);
    let id = url.searchParams.get('id');

    if (!id) {
        try {
            const body = await request.json();
            id = body?.id;
        } catch {
            // query param check was already performed
        }
    }

    if (!id) {
        return NextResponse.json({ error: 'BadRequest: Missing account id' }, { status: 400 });
    }

    try {
        const accounts = await deleteSocialAccount(id);
        await logActivity(gate.user, 'delete', 'socials', id);
        return NextResponse.json({ accounts });
    } catch (e) {
        return NextResponse.json(
            { error: e instanceof Error ? e.message : 'Failed to delete account' },
            { status: 500 }
        );
    }
}

