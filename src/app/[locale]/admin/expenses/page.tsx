"use client";

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Modal, Field, PageHeader, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz, type Party } from '@/components/admin/biz/ui';

type Expense = {
    id: string;
    expense_number: string;
    date: string;
    description: string;
    category: string;
    amount_ttc: number;
    tva_rate: number;
    payment_method: string;
    notes: string | null;
    party: { id: string; name: string } | null;
};

const today = () => new Date().toISOString().slice(0, 10);
const blank = () => ({ id: '', date: today(), description: '', category: 'hosting', amount_ttc: '', tva_rate: '0', payment_method: 'cash', party_id: '', notes: '' });

export default function ExpensesPage() {
    const { b, formatMoney, formatDate } = useBiz();
    const e = b.expenses;
    const cats = b.categories as Record<string, string>;
    const methods = b.methods as Record<string, string>;
    const [items, setItems] = useState<Expense[] | null>(null);
    const [suppliers, setSuppliers] = useState<Party[]>([]);
    const [form, setForm] = useState<ReturnType<typeof blank> | null>(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const load = useCallback(() => {
        api<Expense[]>('/api/biz/expenses').then(setItems).catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);

    useEffect(() => {
        load();
        api<Party[]>('/api/biz/parties').then(list => setSuppliers(list.filter(p => p.type !== 'client'))).catch(() => {});
    }, [load]);

    const set = (k: keyof ReturnType<typeof blank>) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => (f ? { ...f, [k]: ev.target.value } : f));

    const save = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!form) return;
        setSaving(true);
        try {
            const payload = { ...form, amount_ttc: parseFloat(form.amount_ttc.replace(',', '.')), tva_rate: parseFloat(form.tva_rate), party_id: form.party_id || null };
            await api('/api/biz/expenses', form.id ? 'PATCH' : 'POST', payload);
            setForm(null);
            setError('');
            load();
        } catch {
            setError(b.common.saveError);
        } finally {
            setSaving(false);
        }
    };

    const remove = async (x: Expense) => {
        if (!confirm(`${b.common.confirmDelete}\n${x.description}`)) return;
        try {
            await api(`/api/biz/expenses?id=${x.id}`, 'DELETE');
            setItems(list => (list ?? []).filter(i => i.id !== x.id));
        } catch {
            setError(b.common.saveError);
        }
    };

    const month = today().slice(0, 7);
    const year = today().slice(0, 4);
    const sum = (pred: (x: Expense) => boolean) => (items ?? []).filter(pred).reduce((s, x) => s + Number(x.amount_ttc), 0);
    const q = search.trim().toLowerCase();
    const visible = (items ?? []).filter(x => !q || [x.description, x.party?.name, cats[x.category]].some(v => v?.toLowerCase().includes(q)));

    return (
        <div className="space-y-6">
            <PageHeader title={e.title} subtitle={e.subtitle}>
                <button onClick={() => setForm(blank())} className={primaryBtn}><Plus className="w-4 h-4" />{e.new}</button>
            </PageHeader>

            <ErrorBox message={error} />

            <div className="grid grid-cols-2 gap-3 max-w-lg">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-white/60">{e.thisMonth}</div>
                    <div className="text-xl font-bold mt-1">{formatMoney(sum(x => x.date.startsWith(month)))}</div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                    <div className="text-xs text-white/60">{e.thisYear}</div>
                    <div className="text-xl font-bold mt-1">{formatMoney(sum(x => x.date.startsWith(year)))}</div>
                </div>
            </div>

            <div className="relative">
                <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 start-4" />
                <input value={search} onChange={ev => setSearch(ev.target.value)} placeholder={b.common.search} className={`${inputClass} ps-11`} />
            </div>

            {items === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{b.common.empty}</div>
            ) : (
                <ul className="bg-white/5 border border-white/10 rounded-2xl divide-y divide-white/5">
                    {visible.map(x => (
                        <li key={x.id} className="flex items-center gap-3 p-4">
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate">{x.description}</div>
                                <div className="text-xs text-white/55 mt-0.5 flex flex-wrap gap-x-3">
                                    <span>{formatDate(x.date)}</span>
                                    <span>{cats[x.category] ?? x.category}</span>
                                    {x.party && <span>{x.party.name}</span>}
                                    <span>{methods[x.payment_method] ?? x.payment_method}</span>
                                </div>
                            </div>
                            <div className="font-bold whitespace-nowrap">{formatMoney(x.amount_ttc)}</div>
                            <button
                                onClick={() => setForm({ id: x.id, date: x.date, description: x.description, category: x.category, amount_ttc: String(x.amount_ttc), tva_rate: String(x.tva_rate ?? 0), payment_method: x.payment_method || 'cash', party_id: x.party?.id ?? '', notes: x.notes ?? '' })}
                                className="p-2 rounded-lg hover:bg-white/10 cursor-pointer"
                                aria-label={b.common.edit}
                            >
                                <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => remove(x)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer" aria-label={b.common.delete}>
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {form && (
                <Modal title={form.id ? b.common.edit : e.new} onClose={() => setForm(null)}>
                    <form onSubmit={save} className="space-y-4">
                        <Field label={e.description}>
                            <input required autoFocus value={form.description} onChange={set('description')} className={inputClass} />
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label={e.amount}>
                                <input required inputMode="decimal" value={form.amount_ttc} onChange={set('amount_ttc')} className={inputClass} />
                            </Field>
                            <Field label={b.common.date}>
                                <input type="date" required value={form.date} onChange={set('date')} className={inputClass} />
                            </Field>
                        </div>
                        <Field label={e.category}>
                            <select value={form.category} onChange={set('category')} className={inputClass}>
                                {Object.entries(cats).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <div className="grid grid-cols-2 gap-3">
                            <Field label={e.method}>
                                <select value={form.payment_method} onChange={set('payment_method')} className={inputClass}>
                                    {Object.entries(methods).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                                </select>
                            </Field>
                            <Field label={b.docs.tva}>
                                <select value={form.tva_rate} onChange={set('tva_rate')} className={inputClass}>
                                    <option value="0">{b.docs.noTva}</option>
                                    <option value="16">16%</option>
                                </select>
                            </Field>
                        </div>
                        <Field label={e.supplier}>
                            <select value={form.party_id} onChange={set('party_id')} className={inputClass}>
                                <option value="">{e.none}</option>
                                {suppliers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </Field>
                        <Field label={b.common.notes}>
                            <textarea rows={2} value={form.notes} onChange={set('notes')} className={`${inputClass} resize-y`} />
                        </Field>
                        <div className="flex gap-2 pt-2">
                            <button type="submit" disabled={saving} className={`${primaryBtn} flex-1`}>{saving ? '…' : b.common.save}</button>
                            <button type="button" onClick={() => setForm(null)} className={ghostBtn}>{b.common.cancel}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
