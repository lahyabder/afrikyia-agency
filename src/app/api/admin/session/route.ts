import { NextResponse } from 'next/server';
import {
    ADMIN_COOKIE,
    SESSION_MAX_AGE,
    checkCredentials,
    createSessionToken,
    isAdminRequest,
} from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

// Check whether the current browser has a valid admin session
export async function GET(request: Request) {
    return NextResponse.json({ authenticated: isAdminRequest(request) });
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

    if (!checkCredentials(email, password)) {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const token = createSessionToken();
    if (!token) {
        return NextResponse.json({ error: 'AuthNotConfigured' }, { status: 500 });
    }

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
