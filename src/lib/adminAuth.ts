import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// Server-only admin authentication.
// - The owner account comes from environment variables (ADMIN_EMAIL, ADMIN_PASSWORD) and always has full access.
// - Team accounts live in the admin_users table with a hashed password and a role.
// - Sessions are HMAC-signed cookies (ADMIN_SESSION_SECRET). Team sessions are re-checked against the database
//   on every request, so disabling a user or changing their password signs them out at once.

export const ADMIN_COOKIE = 'afrikyia-admin-session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

export const ROLES = ['admin', 'accountant', 'user'] as const;
export type Role = (typeof ROLES)[number];

// Which roles may use each part of the admin panel
export const AREAS = {
    dashboard: ['admin', 'accountant', 'user'],
    publishing: ['admin', 'user'],
    messages: ['admin', 'user'],
    finance: ['admin', 'accountant'],
    hr: ['admin', 'accountant'],
    users: ['admin'],
} as const satisfies Record<string, readonly Role[]>;
export type Area = keyof typeof AREAS;

export type SessionUser = { id: string; email: string; name: string; role: Role; owner: boolean };

const OWNER_ID = 'owner';

function getSecret(): string | null {
    const secret = process.env.ADMIN_SESSION_SECRET?.trim();
    return secret && secret.length >= 32 ? secret : null;
}

function sign(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex');
}

function safeEqual(a: string, b: string): boolean {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) {
        // Compare against itself to keep timing uniform, then fail
        timingSafeEqual(bufA, bufA);
        return false;
    }
    return timingSafeEqual(bufA, bufB);
}

// scrypt$<salt>$<hash>
export function hashPassword(password: string): string {
    const salt = randomBytes(16).toString('hex');
    return `scrypt$${salt}$${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password: string, stored: string | null): boolean {
    const [scheme, salt, hash] = (stored || '').split('$');
    if (scheme !== 'scrypt' || !salt || !hash) {
        scryptSync(password, 'timing-only', 64); // keep timing uniform for unknown accounts
        return false;
    }
    return safeEqual(scryptSync(password, salt, 64).toString('hex'), hash);
}

function ownerUser(): SessionUser | null {
    const email = process.env.ADMIN_EMAIL?.trim();
    return email ? { id: OWNER_ID, email: email.toLowerCase(), name: 'Owner', role: 'admin', owner: true } : null;
}

function checkOwner(email: string, password: string): boolean {
    // Trim env values: pasted values often carry a stray space or newline
    const expectedEmail = process.env.ADMIN_EMAIL?.trim();
    const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
    if (!expectedEmail || !expectedPassword) return false;
    const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.toLowerCase());
    const passwordOk = safeEqual(password, expectedPassword);
    return emailOk && passwordOk;
}

// Returns the user for valid credentials (owner or an active team account), otherwise null.
export async function authenticate(email: string, password: string): Promise<{ user: SessionUser; version: number } | null> {
    if (!getSecret()) {
        // Logs which setting is missing, never the values themselves
        console.error('[admin-auth] Login disabled: ADMIN_SESSION_SECRET missing or shorter than 32 characters');
        return null;
    }
    if (checkOwner(email, password)) {
        const owner = ownerUser();
        return owner ? { user: owner, version: 0 } : null;
    }
    const normalized = email.trim().toLowerCase();
    const { data } = await supabaseAdmin
        .from('admin_users')
        .select('id, email, name, name_ar, role, is_active, password_hash, session_version')
        .eq('email', normalized)
        .maybeSingle();
    const ok = verifyPassword(password, data?.password_hash ?? null);
    if (!data || !ok || data.is_active === false || !ROLES.includes(data.role)) {
        console.warn('[admin-auth] Failed login');
        return null;
    }
    await supabaseAdmin.from('admin_users').update({ last_login: new Date().toISOString() }).eq('id', data.id);
    return {
        user: { id: data.id, email: data.email, name: data.name_ar || data.name, role: data.role, owner: false },
        version: data.session_version ?? 1,
    };
}

export function createSessionToken(user: SessionUser, version: number): string | null {
    const secret = getSecret();
    if (!secret) return null;
    const payload = Buffer.from(JSON.stringify({ uid: user.id, v: version, exp: Date.now() + SESSION_MAX_AGE * 1000 })).toString('base64url');
    return `${payload}.${sign(payload, secret)}`;
}

function readCookie(request: Request, name: string): string | null {
    const header = request.headers.get('cookie');
    if (!header) return null;
    for (const part of header.split(';')) {
        const [key, ...rest] = part.trim().split('=');
        if (key === name) return decodeURIComponent(rest.join('='));
    }
    return null;
}

// The signed-in user behind this request, or null.
export async function getSessionUser(request: Request): Promise<SessionUser | null> {
    const secret = getSecret();
    const token = readCookie(request, ADMIN_COOKIE);
    if (!secret || !token) return null;
    const [payload, signature] = token.split('.');
    if (!payload || !signature || !safeEqual(signature, sign(payload, secret))) return null;
    let claims: { uid?: string; v?: number; exp?: number };
    try {
        claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    } catch {
        return null;
    }
    if (!claims.uid || !claims.exp || claims.exp < Date.now()) return null;
    if (claims.uid === OWNER_ID) return ownerUser();

    const { data } = await supabaseAdmin
        .from('admin_users')
        .select('id, email, name, name_ar, role, is_active, session_version')
        .eq('id', claims.uid)
        .maybeSingle();
    if (!data || data.is_active === false || (data.session_version ?? 1) !== claims.v || !ROLES.includes(data.role)) return null;
    return { id: data.id, email: data.email, name: data.name_ar || data.name, role: data.role, owner: false };
}

export function canAccess(user: SessionUser | null, area: Area): boolean {
    return !!user && (AREAS[area] as readonly Role[]).includes(user.role);
}

// Gate for API routes: `const gate = await requireAccess(request, 'finance'); if (gate.denied) return gate.denied;`
export async function requireAccess(
    request: Request,
    area: Area
): Promise<{ denied: NextResponse; user?: undefined } | { denied?: undefined; user: SessionUser }> {
    const user = await getSessionUser(request);
    if (!user) return { denied: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
    if (!canAccess(user, area)) return { denied: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
    return { user };
}
