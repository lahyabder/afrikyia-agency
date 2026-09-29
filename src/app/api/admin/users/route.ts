import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { ROLES, hashPassword, requireAccess, type Role } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { readJson, text } from '@/lib/biz';

export const dynamic = 'force-dynamic';

const FIELDS = 'id, email, name, name_ar, role, is_active, last_login, created_at, password_hash';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

// Never send the hash to the browser, only whether a password is set
function publicUser(row: Record<string, unknown>) {
    const { password_hash, ...rest } = row;
    return { ...rest, has_password: !!password_hash };
}

export async function GET(request: Request) {
    const gate = await requireAccess(request, 'users');
    if (gate.denied) return gate.denied;
    const { data, error } = await supabaseAdmin.from('admin_users').select(FIELDS).order('created_at');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json((data ?? []).map(publicUser));
}

export async function POST(request: Request) {
    const gate = await requireAccess(request, 'users');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const email = text(body?.email, 200)?.toLowerCase() ?? '';
    const name = text(body?.name, 200);
    const role = ROLES.includes(body?.role as Role) ? (body?.role as Role) : 'user';
    const password = typeof body?.password === 'string' ? body.password : '';
    if (!name || !EMAIL_RE.test(email)) return NextResponse.json({ error: 'MissingFields' }, { status: 400 });
    if (password.length < MIN_PASSWORD) return NextResponse.json({ error: 'WeakPassword' }, { status: 400 });
    if (email === process.env.ADMIN_EMAIL?.trim().toLowerCase()) return NextResponse.json({ error: 'EmailTaken' }, { status: 409 });

    const { data, error } = await supabaseAdmin
        .from('admin_users')
        .insert({ email, name, name_ar: text(body?.name_ar, 200), role, is_active: true, password_hash: hashPassword(password) })
        .select(FIELDS)
        .single();
    if (error) {
        const taken = error.code === '23505';
        return NextResponse.json({ error: taken ? 'EmailTaken' : error.message }, { status: taken ? 409 : 500 });
    }
    await logActivity(gate.user, 'create', 'user', `${email} (${role})`, data.id);
    return NextResponse.json(publicUser(data));
}

// Edit name/role/active state, or set a new password. Either change signs the user out everywhere.
export async function PATCH(request: Request) {
    const gate = await requireAccess(request, 'users');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const id = text(body?.id, 64);
    if (!body || !id) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const { data: current } = await supabaseAdmin.from('admin_users').select('id, email, role, is_active, session_version').eq('id', id).maybeSingle();
    if (!current) return NextResponse.json({ error: 'NotFound' }, { status: 404 });

    const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
    const changes: string[] = [];
    if (body.name !== undefined) update.name = text(body.name, 200) ?? current.email;
    if (body.name_ar !== undefined) update.name_ar = text(body.name_ar, 200);
    if (body.role !== undefined && ROLES.includes(body.role as Role) && body.role !== current.role) {
        if (gate.user.id === id) return NextResponse.json({ error: 'OwnAccount' }, { status: 409 });
        update.role = body.role;
        changes.push(`role ${current.role}→${body.role}`);
    }
    if (typeof body.is_active === 'boolean' && body.is_active !== current.is_active) {
        if (gate.user.id === id) return NextResponse.json({ error: 'OwnAccount' }, { status: 409 });
        update.is_active = body.is_active;
        changes.push(body.is_active ? 'enabled' : 'disabled');
    }
    if (typeof body.password === 'string' && body.password) {
        if (body.password.length < MIN_PASSWORD) return NextResponse.json({ error: 'WeakPassword' }, { status: 400 });
        update.password_hash = hashPassword(body.password);
        changes.push('password reset');
    }
    // Any change to access signs the user out of open sessions
    if (update.role || update.is_active !== undefined || update.password_hash) update.session_version = (current.session_version ?? 1) + 1;

    const { data, error } = await supabaseAdmin.from('admin_users').update(update).eq('id', id).select(FIELDS).single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    await logActivity(gate.user, 'update', 'user', `${current.email}${changes.length ? ': ' + changes.join(', ') : ''}`, id);
    return NextResponse.json(publicUser(data));
}
