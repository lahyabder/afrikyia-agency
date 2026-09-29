"use client";

import type { CompanyInfo } from '@/lib/company';
import { LetterheadHeader, SignatureBlock, paperLocale, type PaperLang, type Seals } from '@/components/admin/biz/Letterhead';

// A letter on the company letterhead: what the editor previews and what gets printed or saved as PDF

export type LetterData = {
    letter_number: string;
    date: string;
    language: PaperLang;
    recipient: string | null;
    subject: string | null;
    reference: string | null;
    body: string;
    attachments: string | null;
    copies: string | null;
    place: string | null;
    signatory: string | null;
    signatory_title: string | null;
    status?: string;
};

const WORDS: Record<PaperLang, { number: string; to: string; subject: string; reference: string; attachments: string; copies: string; place: string; cancelled: string }> = {
    fr: { number: 'N°', to: 'À', subject: 'Objet', reference: 'V/Réf.', attachments: 'P.J.', copies: 'Ampliation', place: 'Nouakchott', cancelled: 'ANNULÉE' },
    ar: { number: 'الرقم', to: 'إلى', subject: 'الموضوع', reference: 'مرجعكم', attachments: 'المرفقات', copies: 'نسخة إلى', place: 'نواكشوط', cancelled: 'ملغاة' },
    en: { number: 'Ref.', to: 'To', subject: 'Subject', reference: 'Your ref.', attachments: 'Enclosures', copies: 'Copy to', place: 'Nouakchott', cancelled: 'CANCELLED' },
};

// Opening and closing lines a new letter starts with, per language
export const LETTER_TEMPLATES: Record<PaperLang, string> = {
    fr: 'Madame, Monsieur,\n\n\n\nVeuillez agréer, Madame, Monsieur, l’expression de nos salutations distinguées.',
    ar: 'تحية طيبة وبعد،\n\n\n\nوتقبلوا فائق التقدير والاحترام.',
    en: 'Dear Sir or Madam,\n\n\n\nYours faithfully,',
};

export function placeAndDate(lang: PaperLang, place: string | null, iso: string): string {
    const where = place?.trim() || WORDS[lang].place;
    const when = iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(paperLocale(lang), { dateStyle: 'long' }) : '';
    if (lang === 'fr') return `${where}, le ${when}`;
    if (lang === 'ar') return `${where} في ${when}`;
    return `${where}, ${when}`;
}

export default function LetterPaper({ letter, company, seals, withSeal, className = '' }: { letter: LetterData; company: CompanyInfo; seals: Seals; withSeal: boolean; className?: string }) {
    const lang = letter.language;
    const W = WORDS[lang];
    const rtl = lang === 'ar';
    return (
        <article
            dir={rtl ? 'rtl' : 'ltr'}
            lang={lang}
            className={`paper relative bg-white text-[#14161A] rounded-2xl print:rounded-none shadow-xl print:shadow-none max-w-[820px] mx-auto p-8 sm:p-12 print:p-0 text-[13.5px] leading-7 ${rtl ? 'arabic-font' : 'font-sans'} ${className}`}
        >
            {letter.status === 'cancelled' && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
                    <span className="text-7xl font-black text-[#E11D48]/15 -rotate-[30deg] tracking-widest">{W.cancelled}</span>
                </div>
            )}

            <LetterheadHeader company={company} lang={lang}>
                <div className="text-xs text-[#4B515A]">{placeAndDate(lang, letter.place, letter.date)}</div>
                <div className="mt-1 text-xs text-[#4B515A]">{W.number} <b className="text-[#14161A]" dir="ltr">{letter.letter_number || '—'}</b></div>
            </LetterheadHeader>

            {letter.recipient && (
                <section className={`mt-8 max-w-sm ${rtl ? '' : 'ms-auto'}`}>
                    <div className="text-[11px] font-bold text-[#E11D48]">{W.to}</div>
                    <div className="whitespace-pre-wrap font-bold leading-6">{letter.recipient}</div>
                </section>
            )}

            <section className="mt-8 space-y-0.5">
                <p><b>{W.subject} :</b> {letter.subject}</p>
                {letter.reference && <p><b>{W.reference} :</b> <span dir="auto">{letter.reference}</span></p>}
                {letter.attachments && <p><b>{W.attachments} :</b> {letter.attachments}</p>}
            </section>

            <div className="mt-6 whitespace-pre-wrap text-justify">{letter.body}</div>

            <div className="mt-8 flex justify-end break-inside-avoid">
                <SignatureBlock name={letter.signatory || company.signatory} title={letter.signatory_title || company.signatoryTitle} seals={seals} withSeal={withSeal} />
            </div>

            {letter.copies && (
                <section className="mt-4 text-xs text-[#4B515A] break-inside-avoid">
                    <b className="text-[#14161A]">{W.copies} :</b>
                    <div className="whitespace-pre-wrap">{letter.copies}</div>
                </section>
            )}
        </article>
    );
}
