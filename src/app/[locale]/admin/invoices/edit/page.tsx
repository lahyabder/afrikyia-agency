"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Trash2, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import PartyForm from '@/components/admin/biz/PartyForm';
import { Field, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz, type Party } from '@/components/admin/biz/ui';

type Line = { description: string; quantity: string; unit_price: string };
const emptyLine = (): Line => ({ description: '', quantity: '1', unit_price: '' });
const today = () => new Date().toISOString().slice(0, 10);
const num = (v: string) => {
    const n = parseFloat(v.replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
};

// Create or edit an invoice or a quote: /admin/invoices/edit?type=quote or ?id=...
export default function DocumentEditorPage() {
    return (
        <Suspense fallback={null}>
            <DocumentEditor />
        </Suspense>
    );
}

function DocumentEditor() {
    const params = useSearchParams();
    const id = params.get('id');
    const [type, setType] = useState<'invoice' | 'quote'>(params.get('type') === 'quote' ? 'quote' : 'invoice');
    const { b, isRTL, formatMoney } = useBiz();
    const d = b.docs;
    const router = useRouter();
    const [number, setNumber] = useState('');
    const [parties, setParties] = useState<Party[]>([]);
    const [partyId, setPartyId] = useState('');
    const [date, setDate] = useState(today());
    const [dueDate, setDueDate] = useState('');
    const [tvaRate, setTvaRate] = useState('0');
    const [notes, setNotes] = useState('');
    const [lines, setLines] = useState<Line[]>([emptyLine()]);
    const [addingClient, setAddingClient] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');


    useEffect(() => {
        api<Party[]>('/api/biz/parties').then(setParties).catch(() => setError(b.common.loadError));
        if (id) {
            api<{
                type: 'invoice' | 'quote'; invoice_number: string; party_id: string; date: string; due_date: string | null;
                tva_rate: number; notes: string | null; lines: { description: string; quantity: number; unit_price: number }[];
            }>(`/api/biz/documents/${id}`)
                .then(doc => {
                    setType(doc.type);
                    setNumber(doc.invoice_number);
                    setPartyId(doc.party_id ?? '');
                    setDate(doc.date);
                    setDueDate(doc.due_date ?? '');
                    setTvaRate(String(doc.tva_rate ?? 0));
                    setNotes(doc.notes ?? '');
                    setLines(doc.lines.length ? doc.lines.map(l => ({ description: l.description, quantity: String(l.quantity), unit_price: String(l.unit_price) })) : [emptyLine()]);
                })
                .catch(() => setError(b.common.loadError));
        }
    }, [id, b.common.loadError]);

    const setLine = (i: number, key: keyof Line, value: string) => setLines(ls => ls.map((l, j) => (j === i ? { ...l, [key]: value } : l)));
    const subtotal = lines.reduce((s, l) => s + num(l.quantity) * num(l.unit_price), 0);
    const tva = (subtotal * num(tvaRate)) / 100;

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        const payload = {
            type,
            party_id: partyId,
            date,
            due_date: dueDate || null,
            tva_rate: num(tvaRate),
            notes,
            invoice_number: number.trim() || undefined,
            lines: lines.map(l => ({ description: l.description, quantity: num(l.quantity), unit_price: num(l.unit_price) })),
        };
        try {
            const res = id
                ? await api<{ id: string }>(`/api/biz/documents/${id}`, 'PATCH', payload)
                : await api<{ id: string }>('/api/biz/documents', 'POST', payload);
            router.push(`/admin/invoices/view?id=${id ?? res.id}`);
        } catch (err) {
            const code = (err as { code?: string }).code;
            setError(code === 'AlreadyPaid' ? d.alreadyPaid : code === 'NumberTaken' ? d.numberTaken : b.common.saveError);
            setSaving(false);
        }
    };

    const Back = isRTL ? ArrowRight : ArrowLeft;
    const title = id ? `${d.editTitle} ${number}` : type === 'quote' ? d.newQuote : d.newInvoice;
    const clients = parties.filter(p => p.type !== 'supplier');

    return (
        <>
        <form onSubmit={submit} className="space-y-6 max-w-4xl">
            <div className="flex items-center gap-3">
                <Link href={`/admin/invoices${type === 'quote' ? '?tab=quote' : ''}`} className="p-2 rounded-lg hover:bg-white/10" aria-label={b.common.back}><Back className="w-5 h-5" /></Link>
                <h1 className="text-2xl font-bold">{title}</h1>
            </div>

            <ErrorBox message={error} />

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 grid sm:grid-cols-2 gap-4">
                <Field label={d.client} className="sm:col-span-2">
                    <div className="flex gap-2">
                        <select required value={partyId} onChange={e => setPartyId(e.target.value)} className={inputClass}>
                            <option value="">{d.chooseClient}</option>
                            {clients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button type="button" onClick={() => setAddingClient(true)} className={`${ghostBtn} whitespace-nowrap`}>{d.addClient}</button>
                    </div>
                </Field>
                <Field label={d.numberOptional} className="sm:col-span-2">
                    <input value={number} onChange={e => setNumber(e.target.value)} placeholder={type === 'quote' ? 'DEV/2026/019' : 'F/2026/019'} dir="ltr" className={inputClass} />
                </Field>
                <Field label={b.common.date}>
                    <input type="date" required value={date} onChange={e => setDate(e.target.value)} className={inputClass} />
                </Field>
                <Field label={d.dueDate}>
                    <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} className={inputClass} />
                </Field>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h2 className="font-bold">{d.lines}</h2>
                <div className="hidden sm:grid grid-cols-[1fr_90px_140px_130px_36px] gap-2 text-xs text-white/50 px-1">
                    <span>{d.description}</span><span>{d.qty}</span><span>{d.unitPrice}</span><span>{d.lineTotal}</span><span />
                </div>
                {lines.map((l, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_36px] sm:grid-cols-[1fr_90px_140px_130px_36px] gap-2 items-center border-b border-white/5 sm:border-0 pb-3 sm:pb-0">
                        <textarea
                            required
                            rows={1}
                            placeholder={d.description}
                            value={l.description}
                            onChange={e => setLine(i, 'description', e.target.value)}
                            className={`${inputClass} col-span-3 sm:col-span-1 resize-y min-h-[42px]`}
                        />
                        <input inputMode="decimal" required placeholder={d.qty} value={l.quantity} onChange={e => setLine(i, 'quantity', e.target.value)} className={inputClass} />
                        <input inputMode="decimal" required placeholder={d.unitPrice} value={l.unit_price} onChange={e => setLine(i, 'unit_price', e.target.value)} className={inputClass} />
                        <span className="hidden sm:block text-sm font-semibold px-1 whitespace-nowrap">{formatMoney(num(l.quantity) * num(l.unit_price))}</span>
                        <button
                            type="button"
                            onClick={() => setLines(ls => (ls.length > 1 ? ls.filter((_, j) => j !== i) : ls))}
                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer disabled:opacity-30"
                            disabled={lines.length === 1}
                            aria-label={b.common.delete}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
                <button type="button" onClick={() => setLines(ls => [...ls, emptyLine()])} className="text-sm font-bold text-yellow-400 hover:underline cursor-pointer">{d.addLine}</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
                    <Field label={d.tva}>
                        <select value={tvaRate} onChange={e => setTvaRate(e.target.value)} className={inputClass}>
                            <option value="0">{d.noTva}</option>
                            <option value="16">16%</option>
                        </select>
                    </Field>
                    <Field label={b.common.notes}>
                        <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)} className={`${inputClass} resize-y`} />
                    </Field>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2 text-sm self-start">
                    <div className="flex justify-between"><span className="text-white/60">{d.subtotal}</span><span>{formatMoney(subtotal)}</span></div>
                    <div className="flex justify-between"><span className="text-white/60">{d.tva} {num(tvaRate)}%</span><span>{formatMoney(tva)}</span></div>
                    <div className="flex justify-between pt-2 border-t border-white/10 text-lg font-bold"><span>{d.totalTtc}</span><span>{formatMoney(subtotal + tva)}</span></div>
                </div>
            </div>

            <div className="flex gap-2">
                <button type="submit" disabled={saving} className={primaryBtn}>{saving ? '…' : b.common.save}</button>
                <Link href="/admin/invoices" className={ghostBtn}>{b.common.cancel}</Link>
            </div>
        </form>

            {addingClient && (
                <PartyForm
                    onClose={() => setAddingClient(false)}
                    onSaved={p => {
                        setParties(list => [...list, p].sort((a, c) => a.name.localeCompare(c.name)));
                        setPartyId(p.id);
                        setAddingClient(false);
                    }}
                />
            )}
        </>
    );
}
