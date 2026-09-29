import { NextResponse } from 'next/server';
import { requireAccess } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { readJson } from '@/lib/biz';
import { toolsFor } from '@/lib/assistant';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

// Natural voice for the assistant's answers through ElevenLabs. The key stays on the server; the browser receives
// only the audio. Without a key (or on any error) the panel falls back to the browser's own voice.
const API = process.env.ELEVENLABS_BASE_URL?.trim() || 'https://api.elevenlabs.io/v1';
const MAX_CHARS = 700; // keeps each answer within a small share of the monthly credits
const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID?.trim() || 'JBFqnCBsd6RMkjVDRZzb';
const MODEL = process.env.ELEVENLABS_MODEL?.trim() || 'eleven_multilingual_v2';
const VOICE_ID = /^[A-Za-z0-9]{10,40}$/;

function key() {
    return process.env.ELEVENLABS_API_KEY?.trim() || null;
}

// Voices of the account, for the voice picker (needs the key's "Voices: read" permission)
export async function GET(request: Request) {
    const gate = await requireAccess(request, 'dashboard');
    if (gate.denied) return gate.denied;
    const apiKey = key();
    if (!apiKey) return NextResponse.json({ error: 'NotConfigured' }, { status: 503 });
    const res = await fetch(`${API}/voices`, { headers: { 'xi-api-key': apiKey }, cache: 'no-store' });
    if (!res.ok) return NextResponse.json({ voices: [], defaultVoice: DEFAULT_VOICE });
    const data = (await res.json()) as { voices?: { voice_id: string; name: string; labels?: Record<string, string> }[] };
    const voices = (data.voices ?? []).map(v => ({
        id: v.voice_id,
        name: v.name,
        details: [v.labels?.language, v.labels?.accent, v.labels?.gender].filter(Boolean).join(' · '),
    }));
    return NextResponse.json({ voices, defaultVoice: DEFAULT_VOICE });
}

export async function POST(request: Request) {
    const gate = await requireAccess(request, 'dashboard');
    if (gate.denied) return gate.denied;
    if (toolsFor(gate.user).length === 0) return NextResponse.json({ error: 'NoAccess' }, { status: 403 });
    const apiKey = key();
    if (!apiKey) return NextResponse.json({ error: 'NotConfigured' }, { status: 503 });
    const body = await readJson(request);
    const text = typeof body?.text === 'string' ? body.text.trim().slice(0, MAX_CHARS) : '';
    if (!text) return NextResponse.json({ error: 'BadRequest' }, { status: 400 });
    const voice = typeof body?.voice === 'string' && VOICE_ID.test(body.voice) ? body.voice : DEFAULT_VOICE;

    const res = await fetch(`${API}/text-to-speech/${voice}?output_format=mp3_44100_64`, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text, model_id: MODEL, voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0.2, use_speaker_boost: true } }),
    });
    if (!res.ok) {
        const detail = (await res.text().catch(() => '')).slice(0, 300);
        console.error('[speech] ElevenLabs error', res.status, detail);
        // The reason is kept in the activity log (it holds ElevenLabs' message only, never the key)
        await logActivity(gate.user, 'speak_failed', 'assistant', `${res.status} ${detail}`);
        const code =
            res.status === 401
                ? 'KeyRejected'
                : /paid_plan|payment|subscription|library|not.*allowed|permission/i.test(detail)
                  ? 'VoiceNotAllowed'
                  : /quota|credit/i.test(detail)
                    ? 'NoCredit'
                    : 'Failed';
        return NextResponse.json({ error: code, status: res.status }, { status: 502 });
    }
    await logActivity(gate.user, 'speak', 'assistant', `${text.length} characters`);
    return new NextResponse(res.body, { headers: { 'Content-Type': 'audio/mpeg', 'Cache-Control': 'private, no-store' } });
}
