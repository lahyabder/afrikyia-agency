import { createHmac, timingSafeEqual } from 'crypto';
import { NextResponse } from 'next/server';

// Server-only admin authentication.
// Credentials live in environment variables, never in client code:
//   ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_SECRET (long random string)

export const ADMIN_COOKIE = 'afrikyia-admin-session';
export const SESSION_MAX_AGE = 60 * 60 * 12; // 12 hours

function getSecret(): string | null {
    const secret = process.env.ADMIN_SESSION_SECRET;
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

export function checkCredentials(email: string, password: string): boolean {
    const expectedEmail = process.env.ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    if (!expectedEmail || !expectedPassword || !getSecret()) return false;
    const emailOk = safeEqual(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
    const passwordOk = safeEqual(password, expectedPassword);
    return emailOk && passwordOk;
}

export function createSessionToken(): string | null {
    const secret = getSecret();
    if (!secret) return null;
    const expires = String(Date.now() + SESSION_MAX_AGE * 1000);
    return `${expires}.${sign(expires, secret)}`;
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

export function isAdminRequest(request: Request): boolean {
    const secret = getSecret();
    const token = readCookie(request, ADMIN_COOKIE);
    if (!secret || !token) return false;
    const [expires, signature] = token.split('.');
    if (!expires || !signature) return false;
    if (!safeEqual(signature, sign(expires, secret))) return false;
    return Number(expires) > Date.now();
}

// Returns a 401 response when the request is not from a logged-in admin, otherwise null.
export function requireAdmin(request: Request): NextResponse | null {
    if (isAdminRequest(request)) return null;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
