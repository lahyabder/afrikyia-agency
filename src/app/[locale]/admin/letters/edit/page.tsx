"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Printer, Stamp } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { Field, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz, type Party } from '@/components/admin/biz/ui';
import { useCompanySeals, type PaperLang } from '@/components/admin/biz/Letterhead';
import LetterPaper, { LETTER_TEMPLATES, type LetterData } from '@/components/admin/biz/LetterPaper';

const today = () => new Date().toISOString().slice(0, 10);

type Form = {
    letter_number: string;
    date: string;
    language: PaperLang;
    party_id: string;
    recipient: string;
    subject: string;
    reference: string;
    body: string;
    attachments: string;
    copies: string;
    place: string;
    signatory: string;
    signatory_title: string;
};

// Write or edit a letter (drafts only), with the printed page shown beside the form: /admin/letters/edit?id=...
export default function LetterEditorPage() {
    return (
        <Suspense fallback={null}>
            <LetterEditor />
        </Suspense>
    );
}

function LetterEditor() {
    const id = useSearchParams().get('id');
    const { b, isRTL } = useBiz();
    const l = b.letters;
    const router = useRouter();
    const { company, bank, seals } = useCompanySeals();
    const [parties, setParties] = useState<Party[]>([]);
    const [form, setForm] = useState<Form>({
        letter_number: '', date: today(), language: 'fr', party_id: '', recipient: '', subject: '', reference: '',
        body: LETTER_TEMPLATES.fr, attachments: '', copies: '', place: '', signatory: '', signatory_title: '',
    });
    const [loaded, setLoaded] = useState(!id);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        api<Party[]>('/api/biz/parties').then(setParties).catch(() => {});
        if (!id) return;
        api<LetterData & { party_id: string | null; status: string }>(`/api/biz/letters/${id}`)
            .then(x => {
                if (x.status !== 'draft') {
                    router.replace(`/admin/letters/view?id=${id}`);
                    return;
                }
                setForm({
                    letter_number: x.letter_number, date: x.date, language: x.language, party_id: x.party_id ?? '', recipient: x.recipient ?? '',
                    subject: x.subject ?? '', reference: x.reference ?? '', body: x.body ?? '', attachments: x.attachments ?? '', copies: x.copies ?? '',
                    place: x.place ?? '', signatory: x.signatory ?? '', signatory_title: x.signatory_title ?? '',
                });
                setLoaded(true);
            })
            .catch(() => setError(b.common.loadError));
    }, [id, b.common.loadError, router]);

    const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm(f => ({ ...f, [key]: value }));

    // Switching language swaps the opening and closing lines while the letter is still the untouched template
    const setLanguage = (lang: PaperLang) =>
        setForm(f => ({ ...f, language: lang, body: f.body === LETTER_TEMPLATES[f.language] || !f.body.trim() ? LETTER_TEMPLATES[lang] : f.body }));

    const pickParty = (partyId: string) => {
        const p = parties.find(x => x.id === partyId);
        setForm(f => ({ ...f, party_id: partyId, recipient: p ? [p.name, p.address].filter(Boolean).join('\n') : f.recipient }));
    };

    const save = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
        const print = submitter?.name === 'print' ? submitter.value : '';
        if (!form.subject.trim()) return setError(l.missingSubject);
        setSaving(true);
        setError('');
        try {
            const payload = { ...form, party_id: form.party_id || null, letter_number: form.letter_number.trim() || null };
            const res = id
                ? await api<{ id: string }>(`/api/biz/letters/${id}`, 'PATCH', { action: 'save', ...payload })
                : await api<{ id: string }>('/api/biz/letters', 'POST', payload);
            router.push(`/admin/letters/view?id=${id ?? res.id}${print ? `&print=${print}` : ''}`);
        } catch (err) {
            setError((err as { code?: string }).code === 'NumberTaken' ? b.docs.numberTaken : b.common.saveError);
            setSaving(false);
        }
    };

    const Back = isRTL ? ArrowRight : ArrowLeft;
    if (!loaded) return <div className="space-y-4"><ErrorBox message={error} />{!error && <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>}</div>;

    const preview: LetterData = { ...form, letter_number: form.letter_number || 'L/…', status: 'draft' };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <Link href={id ? `/admin/letters/view?id=${id}` : '/admin/letters'} className="p-2 rounded-lg hover:bg-white/10" aria-label={b.common.back}><Back className="w-5 h-5" /></Link>
                <h1 className="text-2xl font-bold">{id ? l.editTitle : l.newTitle}</h1>
            </div>
            <ErrorBox message={error} />

            <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,460px)_minmax(0,1fr)] gap-6 items-start">
                <form onSubmit={save} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={l.language}>
                            <div className="flex bg-black/30 border border-white/10 rounded-xl p-1">
                                {(['fr', 'ar', 'en'] as const).map(x => (
                                    <button type="button" key={x} onClick={() => setLanguage(x)} className={`flex-1 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${form.language === x ? 'bg-yellow-400 text-black' : 'text-white/60'}`}>{x.toUpperCase()}</button>
                                ))}
                            </div>
                        </Field>
                        <Field label={l.date}>
                            <input type="date" required value={form.date} onChange={e => set('date', e.target.value)} className={inputClass} />
                        </Field>
                    </div>
                    <Field label={l.numberOptional}>
                        <input value={form.letter_number} onChange={e => set('letter_number', e.target.value)} placeholder="L/2026/001" dir="ltr" className={inputClass} />
                    </Field>
                    <Field label={l.pickParty}>
                        <select value={form.party_id} onChange={e => pickParty(e.target.value)} className={inputClass}>
                            <option value="">—</option>
                            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </Field>
                    <Field label={`${l.recipient} — ${l.recipientHint}`}>
                        <textarea rows={3} value={form.recipient} onChange={e => set('recipient', e.target.value)} dir="auto" className={inputClass} />
                    </Field>
                    <Field label={l.subject}>
                        <input required value={form.subject} onChange={e => set('subject', e.target.value)} dir="auto" className={inputClass} />
                    </Field>
                    <Field label={l.reference}>
                        <input value={form.reference} onChange={e => set('reference', e.target.value)} dir="auto" className={inputClass} />
                    </Field>
                    <Field label={`${l.body} — ${l.bodyHint}`}>
                        <textarea rows={14} value={form.body} onChange={e => set('body', e.target.value)} dir="auto" className={`${inputClass} leading-6`} />
                    </Field>
                    <Field label={`${l.attachments} — ${l.attachmentsHint}`}>
                        <textarea rows={3} value={form.attachments} onChange={e => set('attachments', e.target.value)} dir="auto" className={inputClass} />
                    </Field>
                    <Field label={l.copies}>
                        <textarea rows={2} value={form.copies} onChange={e => set('copies', e.target.value)} dir="auto" className={inputClass} />
                    </Field>
                    <div className="grid grid-cols-3 gap-3">
                        <Field label={l.place}>
                            <input value={form.place} onChange={e => set('place', e.target.value)} placeholder={form.language === 'ar' ? 'نواكشوط' : 'Nouakchott'} dir="auto" className={inputClass} />
                        </Field>
                        <Field label={l.signatory}>
                            <input value={form.signatory} onChange={e => set('signatory', e.target.value)} placeholder={(form.language === 'ar' && company.signatoryAr) || company.signatory} dir="auto" className={inputClass} />
                        </Field>
                        <Field label={l.signatoryTitle}>
                            <input value={form.signatory_title} onChange={e => set('signatory_title', e.target.value)} placeholder={(form.language === 'ar' && company.signatoryTitleAr) || company.signatoryTitle} dir="auto" className={inputClass} />
                        </Field>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" disabled={saving} className={`${primaryBtn} flex-1`}>{l.save}</button>
                        <Link href={id ? `/admin/letters/view?id=${id}` : '/admin/letters'} className={ghostBtn}>{b.common.cancel}</Link>
                    </div>
                    {/* Save, then open the print window straight away */}
                    <div className="grid sm:grid-cols-2 gap-2 border-t border-white/10 pt-4">
                        <button type="submit" name="print" value="signed" disabled={saving} className={ghostBtn}><Stamp className="w-4 h-4" />{l.savePrintSigned}</button>
                        <button type="submit" name="print" value="plain" disabled={saving} className={ghostBtn}><Printer className="w-4 h-4" />{l.savePrintPlain}</button>
                    </div>
                </form>

                <div className="min-w-0">
                    <div className="text-xs font-bold text-white/50 mb-2">{l.preview}</div>
                    <LetterPaper letter={preview} company={company} bank={bank} seals={seals} withSeal={false} />
                </div>
            </div>
        </div>
    );
}
