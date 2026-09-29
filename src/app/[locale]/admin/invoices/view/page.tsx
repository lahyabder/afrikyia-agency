"use client";

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { ArrowLeft, ArrowRight, Printer, Pencil, Send, Wallet, FileCheck2, Ban, Trash2 } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { Modal, Field, ErrorBox, StatusBadge, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';

type Doc = {
    id: string;
    invoice_number: string;
    type: 'invoice' | 'quote';
    date: string;
    due_date: string | null;
    status: string;
    subtotal_ht: number;
    tva_rate: number;
    tva_amount: number;
    total_ttc: number;
    paid_amount: number;
    paid_at: string | null;
    notes: string | null;
    party: { name: string; nif?: string; rc?: string; address?: string; phone?: string; email?: string } | null;
    lines: { id: string; description: string; quantity: number; unit_price: number; total_ht: number }[];
    banks: { bank_name: string; rib: string; currency: string }[];
};

type PaperLang = 'fr' | 'ar' | 'en';

// Wording printed on the document, chosen separately from the admin language
const PAPER: Record<PaperLang, Record<string, string>> = {
    fr: { invoice: 'FACTURE', quote: 'DEVIS', number: 'N°', date: 'Date', due: 'Échéance', billTo: 'Client', description: 'Désignation', qty: 'Qté', unit: 'Prix unitaire', total: 'Montant', subtotal: 'Total HT', tva: 'TVA', ttc: 'Total TTC', paid: 'Déjà payé', remaining: 'Reste à payer', bank: 'Coordonnées bancaires', validity: 'Ce devis est valable 30 jours.', thanks: 'Merci de votre confiance.', address: 'Tevragh Zeina – îlot Z, 0003P – Nouakchott, Mauritanie', ids: 'RC 136293/1270 · NIF 01697101', currency: 'MRU' },
    ar: { invoice: 'فاتورة', quote: 'عرض سعر', number: 'رقم', date: 'التاريخ', due: 'تاريخ الاستحقاق', billTo: 'العميل', description: 'البيان', qty: 'الكمية', unit: 'سعر الوحدة', total: 'المبلغ', subtotal: 'المجموع دون ضريبة', tva: 'الضريبة على القيمة المضافة', ttc: 'المجموع الكلي', paid: 'المدفوع', remaining: 'المتبقي', bank: 'الحساب البنكي', validity: 'هذا العرض صالح لمدة 30 يوماً.', thanks: 'شكراً لثقتكم.', address: 'تفرغ زينة – القطعة Z، 0003P – نواكشوط، موريتانيا', ids: 'السجل التجاري 136293/1270 · الرقم الضريبي 01697101', currency: 'أوقية' },
    en: { invoice: 'INVOICE', quote: 'QUOTE', number: 'No.', date: 'Date', due: 'Due date', billTo: 'Bill to', description: 'Description', qty: 'Qty', unit: 'Unit price', total: 'Amount', subtotal: 'Subtotal', tva: 'VAT', ttc: 'Total', paid: 'Paid', remaining: 'Balance due', bank: 'Bank details', validity: 'This quote is valid for 30 days.', thanks: 'Thank you for your business.', address: 'Tevragh Zeina – Lot Z, 0003P – Nouakchott, Mauritania', ids: 'RC 136293/1270 · NIF 01697101', currency: 'MRU' },
};

export default function DocumentViewPage() {
    return (
        <Suspense fallback={null}>
            <DocumentView />
        </Suspense>
    );
}

function DocumentView() {
    const { b, isRTL, formatMoney } = useBiz();
    const d = b.docs;
    const router = useRouter();
    const [doc, setDoc] = useState<Doc | null>(null);
    const [error, setError] = useState('');
    const [paperLang, setPaperLang] = useState<PaperLang>('fr');
    const [paying, setPaying] = useState(false);
    const [busy, setBusy] = useState(false);
    const [payment, setPayment] = useState({ amount: '', method: 'bank', date: new Date().toISOString().slice(0, 10) });

    const id = useSearchParams().get('id');

    const load = useCallback(() => {
        if (!id) return;
        setDoc(null);
        api<Doc>(`/api/biz/documents/${id}`).then(setDoc).catch(() => setError(b.common.loadError));
    }, [id, b.common.loadError]);
    useEffect(load, [load]);

    const act = async (body: Record<string, unknown>) => {
        setBusy(true);
        setError('');
        try {
            const res = await api<{ id?: string } & Partial<Doc>>(`/api/biz/documents/${id}`, 'PATCH', body);
            if (body.action === 'convert' && res.id) router.push(`/admin/invoices/view?id=${res.id}`);
            else load();
        } catch {
            setError(b.common.saveError);
        } finally {
            setBusy(false);
        }
    };

    const remove = async () => {
        if (!confirm(b.common.confirmDelete)) return;
        try {
            await api(`/api/biz/documents/${id}`, 'DELETE');
            router.push('/admin/invoices');
        } catch (e) {
            setError((e as { code?: string }).code === 'CancelInstead' ? d.cancelInstead : b.common.saveError);
        }
    };

    const Back = isRTL ? ArrowRight : ArrowLeft;
    if (!doc) return <div className="space-y-4"><ErrorBox message={error} />{!error && <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>}</div>;

    const L = PAPER[paperLang];
    const paperLocale = paperLang === 'ar' ? 'ar-u-nu-latn' : paperLang === 'fr' ? 'fr-FR' : 'en-GB';
    const pm = (v: number) => `${Number(v || 0).toLocaleString(paperLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${L.currency}`;
    const pd = (iso?: string | null) => (iso ? new Date(`${iso}T00:00:00`).toLocaleDateString(paperLocale, { dateStyle: 'long' }) : '—');
    const remaining = Number(doc.total_ttc) - Number(doc.paid_amount);
    const isInvoice = doc.type === 'invoice';
    const editable = Number(doc.paid_amount) === 0 && doc.status !== 'cancelled';

    return (
        <div className="space-y-6">
            <div className="print:hidden space-y-4">
                <div className="flex items-center gap-3 flex-wrap">
                    <Link href={`/admin/invoices${isInvoice ? '' : '?tab=quote'}`} className="p-2 rounded-lg hover:bg-white/10" aria-label={b.common.back}><Back className="w-5 h-5" /></Link>
                    <h1 className="text-2xl font-bold"><span dir="ltr">{doc.invoice_number}</span></h1>
                    <StatusBadge status={doc.status} />
                </div>
                <ErrorBox message={error} />
                <div className="flex flex-wrap gap-2">
                    <button onClick={() => window.print()} className={primaryBtn}><Printer className="w-4 h-4" />{b.common.print}</button>
                    <div className="flex items-center bg-white/5 border border-white/10 rounded-xl p-1">
                        {(['fr', 'ar', 'en'] as const).map(l => (
                            <button key={l} onClick={() => setPaperLang(l)} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${paperLang === l ? 'bg-white text-black' : 'text-white/60'}`}>{l.toUpperCase()}</button>
                        ))}
                    </div>
                    {editable && <Link href={`/admin/invoices/edit?id=${doc.id}`} className={ghostBtn}><Pencil className="w-4 h-4" />{b.common.edit}</Link>}
                    {doc.status === 'draft' && <button disabled={busy} onClick={() => act({ action: 'status', status: 'sent' })} className={ghostBtn}><Send className="w-4 h-4" />{d.markSent}</button>}
                    {isInvoice && remaining > 0 && doc.status !== 'cancelled' && (
                        <button disabled={busy} onClick={() => { setPayment(p => ({ ...p, amount: String(remaining) })); setPaying(true); }} className={ghostBtn}><Wallet className="w-4 h-4" />{d.recordPayment}</button>
                    )}
                    {!isInvoice && <button disabled={busy} onClick={() => act({ action: 'convert' })} className={ghostBtn}><FileCheck2 className="w-4 h-4" />{d.convert}</button>}
                    {isInvoice && doc.status !== 'draft' && doc.status !== 'cancelled' && Number(doc.paid_amount) === 0 && (
                        <button disabled={busy} onClick={() => confirm(d.cancelDoc + '?') && act({ action: 'status', status: 'cancelled' })} className={`${ghostBtn} text-red-300`}><Ban className="w-4 h-4" />{d.cancelDoc}</button>
                    )}
                    {(!isInvoice || doc.status === 'draft') && <button onClick={remove} className={`${ghostBtn} text-red-300`}><Trash2 className="w-4 h-4" />{b.common.delete}</button>}
                </div>
            </div>

            {/* The paper: what gets printed or saved as PDF */}
            <article
                dir={paperLang === 'ar' ? 'rtl' : 'ltr'}
                lang={paperLang}
                className={`bg-white text-[#14161A] rounded-2xl print:rounded-none shadow-xl print:shadow-none max-w-[820px] mx-auto p-8 sm:p-12 print:p-0 text-[13px] leading-relaxed ${paperLang === 'ar' ? 'arabic-font' : 'font-sans'}`}
            >
                <header className="flex justify-between items-start gap-6 pb-6 border-b-2 border-[#E11D48]">
                    <div>
                        <Image src="/logo.png" alt="Afrikyia" width={160} height={48} className="h-10 w-auto" />
                        <p className="mt-3 text-[#4B515A] text-xs">{L.address}</p>
                        <p className="text-[#4B515A] text-xs">{L.ids}</p>
                        <p className="text-[#4B515A] text-xs" dir="ltr" style={{ textAlign: paperLang === 'ar' ? 'right' : 'left' }}>+222 24 23 22 02 · contact@afrikyia.com</p>
                    </div>
                    <div className="text-end shrink-0">
                        <div className="text-2xl font-bold text-[#E11D48] tracking-wide">{isInvoice ? L.invoice : L.quote}</div>
                        <div className="mt-2 text-xs text-[#4B515A]">{L.number} <b className="text-[#14161A]" dir="ltr">{doc.invoice_number}</b></div>
                        <div className="text-xs text-[#4B515A]">{L.date}: <b className="text-[#14161A]">{pd(doc.date)}</b></div>
                        {doc.due_date && <div className="text-xs text-[#4B515A]">{L.due}: <b className="text-[#14161A]">{pd(doc.due_date)}</b></div>}
                    </div>
                </header>

                <section className="mt-6 mb-8 bg-[#F6F5F2] rounded-lg p-4 max-w-sm">
                    <div className="text-[11px] font-bold text-[#E11D48] mb-1">{L.billTo}</div>
                    <div className="font-bold text-sm">{doc.party?.name}</div>
                    {doc.party?.address && <div className="text-xs text-[#4B515A]">{doc.party.address}</div>}
                    {(doc.party?.nif || doc.party?.rc) && <div className="text-xs text-[#4B515A]" dir="ltr">{[doc.party?.nif && `NIF ${doc.party.nif}`, doc.party?.rc && `RC ${doc.party.rc}`].filter(Boolean).join(' · ')}</div>}
                    {(doc.party?.phone || doc.party?.email) && <div className="text-xs text-[#4B515A]" dir="ltr">{[doc.party?.phone, doc.party?.email].filter(Boolean).join(' · ')}</div>}
                </section>

                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[#14161A] text-white text-xs">
                            <th className="text-start font-bold py-2.5 px-3">{L.description}</th>
                            <th className="text-center font-bold py-2.5 px-3 w-16">{L.qty}</th>
                            <th className="text-end font-bold py-2.5 px-3 w-32">{L.unit}</th>
                            <th className="text-end font-bold py-2.5 px-3 w-36">{L.total}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {doc.lines.map(l => (
                            <tr key={l.id} className="border-b border-[#E4E2DD] align-top">
                                <td className="py-2.5 px-3 whitespace-pre-wrap">{l.description}</td>
                                <td className="py-2.5 px-3 text-center">{Number(l.quantity)}</td>
                                <td className="py-2.5 px-3 text-end whitespace-nowrap">{pm(l.unit_price)}</td>
                                <td className="py-2.5 px-3 text-end whitespace-nowrap">{pm(l.total_ht)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <div className="mt-6 flex justify-end">
                    <div className="w-full max-w-xs space-y-1.5">
                        <div className="flex justify-between"><span className="text-[#4B515A]">{L.subtotal}</span><span>{pm(doc.subtotal_ht)}</span></div>
                        <div className="flex justify-between"><span className="text-[#4B515A]">{L.tva} {Number(doc.tva_rate)}%</span><span>{pm(doc.tva_amount)}</span></div>
                        <div className="flex justify-between bg-[#14161A] text-white font-bold rounded-md px-3 py-2 text-sm"><span>{L.ttc}</span><span>{pm(doc.total_ttc)}</span></div>
                        {isInvoice && Number(doc.paid_amount) > 0 && (
                            <>
                                <div className="flex justify-between"><span className="text-[#4B515A]">{L.paid}</span><span>{pm(doc.paid_amount)}</span></div>
                                <div className="flex justify-between font-bold"><span>{L.remaining}</span><span>{pm(remaining)}</span></div>
                            </>
                        )}
                    </div>
                </div>

                {doc.notes && <p className="mt-8 text-xs text-[#4B515A] whitespace-pre-wrap">{doc.notes}</p>}

                <footer className="mt-10 pt-5 border-t border-[#E4E2DD] text-xs text-[#4B515A] space-y-1">
                    {doc.banks.length > 0 && (
                        <p><b className="text-[#14161A]">{L.bank}:</b> {doc.banks.map(bk => `${bk.bank_name} — ${bk.rib}`).join(' · ')}</p>
                    )}
                    <p>{isInvoice ? L.thanks : L.validity}</p>
                </footer>
            </article>

            {paying && (
                <Modal title={d.recordPayment} onClose={() => setPaying(false)}>
                    <form
                        className="space-y-4"
                        onSubmit={e => {
                            e.preventDefault();
                            setPaying(false);
                            act({ action: 'pay', amount: parseFloat(payment.amount.replace(',', '.')), payment_method: payment.method, paid_at: payment.date });
                        }}
                    >
                        <Field label={`${d.paymentAmount} (${d.remaining}: ${formatMoney(remaining)})`}>
                            <input inputMode="decimal" required value={payment.amount} onChange={e => setPayment(p => ({ ...p, amount: e.target.value }))} className={inputClass} />
                        </Field>
                        <Field label={d.paymentMethod}>
                            <select value={payment.method} onChange={e => setPayment(p => ({ ...p, method: e.target.value }))} className={inputClass}>
                                {Object.entries(b.methods as Record<string, string>).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label={d.paymentDate}>
                            <input type="date" required value={payment.date} onChange={e => setPayment(p => ({ ...p, date: e.target.value }))} className={inputClass} />
                        </Field>
                        <div className="flex gap-2 pt-2">
                            <button type="submit" className={`${primaryBtn} flex-1`}>{b.common.save}</button>
                            <button type="button" onClick={() => setPaying(false)} className={ghostBtn}>{b.common.cancel}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
