// Letters written on the company letterhead: numbered L/2026/001, kept as issued.
import { isoDate, text } from '@/lib/biz';

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
