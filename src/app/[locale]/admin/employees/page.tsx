"use client";

import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Phone, Search, UserRound } from 'lucide-react';
import { Modal, Field, PageHeader, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';

type Employee = {
    id: string;
    matricule: string;
    full_name: string;
    full_name_ar: string | null;
    position: string;
    department: string | null;
    salary_brut: number;
    contract_type: string | null;
    hire_date: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    national_id: string | null;
    cnss_number: string | null;
    bank_name: string | null;
    bank_rib: string | null;
    notes: string | null;
    is_active: boolean;
};

type FormState = Partial<Omit<Employee, 'salary_brut'>> & { salary_brut?: string };

const CONTRACTS = ['CDI', 'CDD', 'Stage', 'Freelance'];

export default function EmployeesPage() {
    const { b, formatMoney, formatDate } = useBiz();
    const e = b.hr.emp;
    const [items, setItems] = useState<Employee[] | null>(null);
    const [filter, setFilter] = useState<'active' | 'inactive' | 'all'>('active');
    const [search, setSearch] = useState('');
    const [form, setForm] = useState<FormState | null>(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(() => {
        api<Employee[]>('/api/biz/employees').then(setItems).catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);
    useEffect(load, [load]);

    const set = (k: keyof FormState) => (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setForm(f => (f ? { ...f, [k]: ev.target.value } : f));

    const save = async (ev: React.FormEvent) => {
        ev.preventDefault();
        if (!form) return;
        setSaving(true);
        try {
            await api('/api/biz/employees', form.id ? 'PATCH' : 'POST', { ...form, salary_brut: parseFloat(String(form.salary_brut ?? '0').replace(',', '.')) || 0 });
            setForm(null);
            setError('');
            load();
        } catch {
            setError(b.common.saveError);
        } finally {
            setSaving(false);
        }
    };

    const q = search.trim().toLowerCase();
    const visible = (items ?? []).filter(
        x => (filter === 'all' || (filter === 'active') === x.is_active) && (!q || [x.full_name, x.full_name_ar, x.position, x.matricule].some(v => v?.toLowerCase().includes(q)))
    );

    return (
        <div className="space-y-6">
            <PageHeader title={e.title} subtitle={e.subtitle}>
                <button onClick={() => setForm({ is_active: true, contract_type: 'CDI' })} className={primaryBtn}><Plus className="w-4 h-4" />{e.new}</button>
            </PageHeader>

            <ErrorBox message={error} />

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                    {(['active', 'inactive', 'all'] as const).map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 rounded-xl text-sm font-bold cursor-pointer ${filter === f ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                            {e[f]}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 start-4" />
                    <input value={search} onChange={ev => setSearch(ev.target.value)} placeholder={b.common.search} className={`${inputClass} ps-11`} />
                </div>
            </div>

            {items === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{b.common.empty}</div>
            ) : (
                <ul className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {visible.map(x => (
                        <li key={x.id} className={`bg-white/5 border rounded-2xl p-5 ${x.is_active ? 'border-white/10' : 'border-white/5 opacity-60'}`}>
                            <div className="flex items-start gap-3">
                                <span className="w-11 h-11 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0"><UserRound className="w-5 h-5" /></span>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold truncate">{x.full_name_ar || x.full_name}</div>
                                    <div className="text-sm text-white/65 truncate">{x.position}</div>
                                </div>
                                <button onClick={() => setForm({ ...x, salary_brut: String(x.salary_brut) })} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer" aria-label={b.common.edit}><Pencil className="w-4 h-4" /></button>
                            </div>
                            <div className="mt-4 flex items-center justify-between text-sm">
                                <span className="font-bold">{formatMoney(x.salary_brut)} <span className="text-white/45 font-normal text-xs">{e.perMonth}</span></span>
                                <span className="text-xs text-white/50" dir="ltr">{x.matricule}</span>
                            </div>
                            <div className="mt-2 text-xs text-white/50 flex flex-wrap gap-x-3 gap-y-1">
                                {x.contract_type && <span>{x.contract_type}</span>}
                                {x.hire_date && <span>{formatDate(x.hire_date)}</span>}
                                {x.phone && <a href={`tel:${x.phone}`} className="flex items-center gap-1 hover:text-yellow-400"><Phone className="w-3 h-3" /><span dir="ltr">{x.phone}</span></a>}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {form && (
                <Modal title={form.id ? `${b.common.edit}: ${form.full_name}` : e.new} onClose={() => setForm(null)}>
                    <form onSubmit={save} className="space-y-5">
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-bold text-yellow-400 mb-2">{e.sectionJob}</legend>
                            <Field label={e.fullName}><input required value={form.full_name ?? ''} onChange={set('full_name')} className={inputClass} /></Field>
                            <Field label={e.fullNameAr}><input value={form.full_name_ar ?? ''} onChange={set('full_name_ar')} dir="rtl" className={inputClass} /></Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label={e.position}><input required value={form.position ?? ''} onChange={set('position')} className={inputClass} /></Field>
                                <Field label={e.department}><input value={form.department ?? ''} onChange={set('department')} className={inputClass} /></Field>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label={e.salary}><input required inputMode="decimal" value={form.salary_brut ?? ''} onChange={set('salary_brut')} className={inputClass} /></Field>
                                <Field label={e.contract}>
                                    <select value={form.contract_type ?? 'CDI'} onChange={set('contract_type')} className={inputClass}>
                                        {CONTRACTS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </Field>
                            </div>
                            <Field label={e.hireDate}><input type="date" value={form.hire_date ?? ''} onChange={set('hire_date')} className={inputClass} /></Field>
                        </fieldset>
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-bold text-yellow-400 mb-2">{e.sectionId}</legend>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label={e.phone}><input value={form.phone ?? ''} onChange={set('phone')} dir="ltr" className={inputClass} /></Field>
                                <Field label={e.email}><input type="email" value={form.email ?? ''} onChange={set('email')} dir="ltr" className={inputClass} /></Field>
                            </div>
                            <Field label={e.address}><input value={form.address ?? ''} onChange={set('address')} className={inputClass} /></Field>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label={e.nationalId}><input value={form.national_id ?? ''} onChange={set('national_id')} dir="ltr" className={inputClass} /></Field>
                                <Field label={e.cnss}><input value={form.cnss_number ?? ''} onChange={set('cnss_number')} dir="ltr" className={inputClass} /></Field>
                            </div>
                        </fieldset>
                        <fieldset className="space-y-3">
                            <legend className="text-xs font-bold text-yellow-400 mb-2">{e.sectionBank}</legend>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label={e.bankName}><input value={form.bank_name ?? ''} onChange={set('bank_name')} className={inputClass} /></Field>
                                <Field label={e.bankRib}><input value={form.bank_rib ?? ''} onChange={set('bank_rib')} dir="ltr" className={inputClass} /></Field>
                            </div>
                            <Field label={e.notes}><textarea rows={2} value={form.notes ?? ''} onChange={set('notes')} className={`${inputClass} resize-y`} /></Field>
                            <label className="flex items-center gap-3 text-sm cursor-pointer">
                                <input type="checkbox" checked={form.is_active !== false} onChange={ev => setForm(f => (f ? { ...f, is_active: ev.target.checked } : f))} className="w-4 h-4 accent-yellow-400" />
                                {e.isActive}
                            </label>
                        </fieldset>
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
