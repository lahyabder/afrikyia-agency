import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { supabaseAdmin } from '@/lib/supabase';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { readJson } from '@/lib/biz';
import { AssistantError, askAssistant, toolsFor, type ChatTurn } from '@/lib/assistant';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_TURNS = 12;
const MAX_CHARS = 4000;
const HOURLY_LIMIT = 40; // questions per user per hour, a guard for the API balance

// Whether the assistant is set up, and whether this user has any data it can read
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'dashboard');
    if (gate.denied) return gate.denied;
    return NextResponse.json({ configured: !!process.env.ANTHROPIC_API_KEY?.trim(), tools: toolsFor(gate.user).length });
}

export async function POST(request: Request) {
    const gate = await requireAccess(request, 'dashboard');
    if (gate.denied) return gate.denied;
    const body = await readJson(request);
    const raw = Array.isArray(body?.messages) ? body.messages : [];
    // Plain text turns only, alternating and ending with the user's question
    const history: ChatTurn[] = raw
        .filter((m: unknown): m is ChatTurn => !!m && typeof m === 'object' && ((m as ChatTurn).role === 'user' || (m as ChatTurn).role === 'assistant') && typeof (m as ChatTurn).text === 'string')
        .map((m: ChatTurn) => ({ role: m.role, text: m.text.trim().slice(0, MAX_CHARS) }))
        .filter((m: ChatTurn) => m.text)
        .slice(-MAX_TURNS);
    while (history.length && history[0].role !== 'user') history.shift();
    const question = history[history.length - 1];
    if (!question || question.role !== 'user' || history.some((m, i) => i > 0 && m.role === history[i - 1].role)) {
        return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    }
    if (toolsFor(gate.user).length === 0) return NextResponse.json({ error: 'NoAccess' }, { status: 403 });

    const since = new Date(Date.now() - 3600_000).toISOString();
    const { count } = await supabaseAdmin
        .from('admin_activity')
        .select('id', { count: 'exact', head: true })
        .eq('action', 'ask')
        .eq('entity', 'assistant')
        .eq('user_email', gate.user.email)
        .gte('created_at', since);
    if ((count ?? 0) >= HOURLY_LIMIT) return NextResponse.json({ error: 'TooMany' }, { status: 429 });

    try {
        const { reply, usage } = await askAssistant(gate.user, history);
        await logActivity(gate.user, 'ask', 'assistant', `${question.text.slice(0, 200)} [${usage.input}+${usage.output} tokens]`);
        return NextResponse.json({ reply });
    } catch (e) {
        if (e instanceof AssistantError) {
            const status = e.code === 'NotConfigured' ? 503 : e.code === 'Refused' ? 422 : 502;
            return NextResponse.json({ error: e.code }, { status });
        }
        if (e instanceof Anthropic.RateLimitError) return NextResponse.json({ error: 'Busy' }, { status: 503 });
        if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return NextResponse.json({ error: 'KeyRejected' }, { status: 503 });
        if (e instanceof Anthropic.APIError) {
            console.error('[assistant] API error', e.status, e.message);
            // An empty prepaid balance comes back as a 400 about credits
            return NextResponse.json({ error: /credit|balance/i.test(e.message) ? 'NoCredit' : 'Failed' }, { status: 502 });
        }
        console.error('[assistant] failed', e);
        return NextResponse.json({ error: 'Failed' }, { status: 502 });
    }
}
