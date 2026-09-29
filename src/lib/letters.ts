// Letters written on the company letterhead: numbered L/2026/001, kept as issued.
import { supabaseAdmin } from '@/lib/supabase';
import type { SessionUser } from '@/lib/adminAuth';
import { logActivity } from '@/lib/activity';
import { isoDate, nextNumber, text } from '@/lib/biz';

export const LETTER_LANGS = ['fr', 'ar', 'en'] as const;
export type LetterLang = (typeof LETTER_LANGS)[number];
export const LETTER_STATUSES = ['draft', 'sent', 'cancelled'] as const;

export const LETTER_FIELDS =
    'id, letter_number, date, language, party_id, recipient, subject, reference, body, attachments, copies, place, signatory, signatory_title, status, created_by, created_at, updated_at, party:parties(id, name, address)';

// Editable content, cleaned
export function letterContent(body: Record<string, unknown>) {
    return {
        date: isoDate(body.date) ?? new Date().toISOString().slice(0, 10),
        language: LETTER_LANGS.includes(body.language as LetterLang) ? (body.language as LetterLang) : 'fr',
        party_id: text(body.party_id, 64),
        recipient: text(body.recipient, 1000),
        subject: text(body.subject, 300),
        reference: text(body.reference, 200),
        body: text(body.body, 20000) ?? '',
        attachments: text(body.attachments, 500),
        copies: text(body.copies, 500),
        place: text(body.place, 80),
        signatory: text(body.signatory, 120),
        signatory_title: text(body.signatory_title, 120),
    };
}

export class LetterError extends Error {
    constructor(public code: 'MissingFields' | 'NumberTaken' | 'NotFound' | 'Locked' | 'Failed', message?: string) {
        super(message ?? code);
    }
}

// New draft letter: the next number in the yearly series, or a number typed by the user
export async function createLetter(user: SessionUser, body: Record<string, unknown>, origin = '') {
    const content = letterContent(body);
    if (!content.subject) throw new LetterError('MissingFields');
    const number = text(body.letter_number, 60) ?? (await nextNumber('company_letters', 'letter_number', 'L', content.date));
    const { data, error } = await supabaseAdmin
        .from('company_letters')
        .insert({ ...content, letter_number: number, status: 'draft', created_by: user.email })
        .select('id, letter_number')
        .single();
    if (error?.code === '23505') throw new LetterError('NumberTaken');
    if (error || !data) throw new LetterError('Failed', error?.message);
    await logActivity(user, 'create', 'letter', `${number} – ${content.subject}${origin}`, data.id);
    return data as { id: string; letter_number: string };
}
