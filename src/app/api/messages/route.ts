import { createHash } from 'crypto';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const STATUSES = ['new', 'handled', 'archived'] as const;
type Status = (typeof STATUSES)[number];

const MAX_PER_WINDOW = 5;
const WINDOW_MINUTES = 10;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Hash the visitor IP so repeated submissions can be throttled without storing the raw address
function hashIp(request: Request): string | null {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip');
    if (!ip) return null;
    const salt = process.env.ADMIN_SESSION_SECRET || 'afrikyia-contact';
    return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

function clean(value: unknown, max: number): string {
    return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

// Public: a visitor sends a message from the contact form
export async function POST(request: Request) {
    let body: Record<string, unknown>;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }

    // Honeypot: real visitors never see or fill this field
    if (clean(body.company, 200)) {
        return NextResponse.json({ success: true });
    }

    const name = clean(body.name, 200);
    const email = clean(body.email, 200);
    const message = clean(body.message, 5000);
    const locale = clean(body.locale, 5) || null;

    if (!name || !message || !EMAIL_RE.test(email)) {
        return NextResponse.json({ error: 'InvalidFields' }, { status: 400 });
    }

    const ipHash = hashIp(request);
    if (ipHash) {
        const since = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();
        const { count } = await supabaseAdmin
            .from('contact_messages')
            .select('id', { count: 'exact', head: true })
            .eq('ip_hash', ipHash)
            .gte('created_at', since);
        if ((count ?? 0) >= MAX_PER_WINDOW) {
            return NextResponse.json({ error: 'TooManyRequests' }, { status: 429 });
        }
    }

    const { error } = await supabaseAdmin
        .from('contact_messages')
        .insert({ name, email, message, locale, ip_hash: ipHash });

    if (error) {
        console.error('Supabase insert contact message error:', error.message);
        return NextResponse.json({ error: 'DatabaseError' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

// Admin: list messages, optionally filtered by status (?status=new)
export async function GET(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const status = new URL(request.url).searchParams.get('status');
    let query = supabaseAdmin
        .from('contact_messages')
        .select('id, name, email, message, status, locale, created_at')
        .order('created_at', { ascending: false })
        .limit(500);
    if (status && (STATUSES as readonly string[]).includes(status)) {
        query = query.eq('status', status);
    }

    const { data, error } = await query;
    if (error) {
        console.error('Supabase list contact messages error:', error.message);
        return NextResponse.json({ error: 'DatabaseError' }, { status: 500 });
    }
    return NextResponse.json(data ?? [], { headers: { 'Cache-Control': 'no-store' } });
}

// Admin: change a message status
export async function PATCH(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    let body: { id?: unknown; status?: unknown };
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }
    if (typeof body.id !== 'string' || !(STATUSES as readonly unknown[]).includes(body.status)) {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
        .from('contact_messages')
        .update({ status: body.status as Status })
        .eq('id', body.id);
    if (error) {
        console.error('Supabase update contact message error:', error.message);
        return NextResponse.json({ error: 'DatabaseError' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}

// Admin: delete a message
export async function DELETE(request: Request) {
    const unauthorized = requireAdmin(request);
    if (unauthorized) return unauthorized;

    const id = new URL(request.url).searchParams.get('id');
    if (!id) {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from('contact_messages').delete().eq('id', id);
    if (error) {
        console.error('Supabase delete contact message error:', error.message);
        return NextResponse.json({ error: 'DatabaseError' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
}
