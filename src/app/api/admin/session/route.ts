import { NextResponse } from 'next/server';
import { ADMIN_COOKIE, AREAS, SESSION_MAX_AGE, authenticate, canAccess, createSessionToken, getSessionUser, type Area } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';

export const dynamic = 'force-dynamic';

// Who is signed in, and which parts of the admin panel they may use
export async function GET(request: Request) {
    const user = await getSessionUser(request);
    if (!user) return NextResponse.json({ authenticated: false });
    const areas = (Object.keys(AREAS) as Area[]).filter(a => canAccess(user, a));
    return NextResponse.json({ authenticated: true, user: { id: user.id, name: user.name, email: user.email, role: user.role, owner: user.owner }, areas });
}

// Log in
export async function POST(request: Request) {
    let email = '';
    let password = '';
    try {
        const body = await request.json();
        email = typeof body.email === 'string' ? body.email : '';
        password = typeof body.password === 'string' ? body.password : '';
    } catch {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }

    const result = await authenticate(email, password);
    if (!result) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const token = createSessionToken(result.user, result.version);
    if (!token) {
        return NextResponse.json({ error: 'AuthNotConfigured' }, { status: 500 });
    }

    await logActivity(result.user, 'login', 'session');
    const response = NextResponse.json({ authenticated: true });
    response.cookies.set(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: SESSION_MAX_AGE,
    });
    return response;
}

// Log out
export async function DELETE() {
    const response = NextResponse.json({ authenticated: false });
    response.cookies.set(ADMIN_COOKIE, '', { httpOnly: true, path: '/', maxAge: 0 });
    return response;
}
