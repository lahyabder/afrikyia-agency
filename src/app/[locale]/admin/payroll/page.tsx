"use client";

import { useCallback, useEffect, useState } from 'react';
import { Printer, Pencil, Check, RotateCcw, Trash2, Settings2, Wand2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Modal, Field, PageHeader, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';
import type { PayrollRates } from '@/lib/payroll';

type Slip = {
    id: string;
    period_year: number;
    period_month: number;
    salary_brut: number;
    bonus: number;
    deductions: number;
    cnss_sal: number;
    cnss_pat: number;
    cnam_sal: number;
    cnam_pat: number;
    its: number;
    net_paye: number;
    is_paid: boolean;
    paid_at: string | null;
    notes: string | null;
    employee: { id: string; matricule: string; full_name: string; full_name_ar: string | null; position: string } | null;
};

const n = (v: unknown) => Number(v || 0);

export default function PayrollPage() {
    const { b, language, formatMoney } = useBiz();
    const p = b.hr.pay;
    const now = new Date();
    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [slips, setSlips] = useState<Slip[] | null>(null);
    const [editing, setEditing] = useState<{ slip: Slip; bonus: string; deductions: string; notes: string } | null>(null);
    const [rates, setRates] = useState<PayrollRates | null>(null);
    const [info, setInfo] = useState('');
    const [error, setError] = useState('');
    const [busy, setBusy] = useState(false);

    const load = useCallback(() => {
        api<Slip[]>(`/api/biz/payroll?year=${year}&month=${month}`)
            .then(list => setSlips(list.sort((a, c) => (a.employee?.matricule ?? '').localeCompare(c.employee?.matricule ?? ''))))
            .catch(() => setError(b.common.loadError));
    }, [year, month, b.common.loadError]);
    useEffect(load, [load]);

    const changePeriod = (y: number, m: number) => {
        setSlips(null);
        setInfo('');
        setYear(y);
        setMonth(m);
    };

    const prepare = async () => {
        setBusy(true);
        setError('');
        try {
            const res = await api<{ created: number }>('/api/biz/payroll', 'POST', { year, month });
            setInfo(res.created ? p.prepared.replace('{n}', String(res.created)) : slips?.length ? p.nothingToPrepare : p.noActive);
            load();
        } catch {
            setError(b.common.saveError);
        } finally {
            setBusy(false);
        }
    };

    const patch = async (body: Record<string, unknown>) => {
        setError('');
        try {
            const updated = await api<Slip>('/api/biz/payroll', 'PATCH', body);
            setSlips(list => (list ?? []).map(s => (s.id === updated.id ? updated : s)));
            return true;
        } catch (e) {
            setError((e as { code?: string }).code === 'AlreadyPaid' ? p.alreadyPaid : b.common.saveError);
            return false;
        }
    };

    const remove = async (s: Slip) => {
        if (!confirm(p.confirmDeleteSlip)) return;
        try {
            await api(`/api/biz/payroll?id=${s.id}`, 'DELETE');
            setSlips(list => (list ?? []).filter(x => x.id !== s.id));
        } catch {
            setError(b.common.saveError);
        }
    };

    const openRates = async () => {
        try {
            setRates(await api<PayrollRates>('/api/biz/payroll/settings'));
        } catch {
            setError(b.common.loadError);
        }
    };

    const saveRates = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try {
            await api('/api/biz/payroll/settings', 'PUT', rates);
            setRates(null);
        } catch {
            setError(b.common.saveError);
        }
    };

    const list = slips ?? [];
    const sum = (f: (s: Slip) => number) => list.reduce((acc, s) => acc + f(s), 0);
    const totals = [
        { label: p.toEmployees, value: sum(s => n(s.net_paye)) },
        { label: p.toCnss, value: sum(s => n(s.cnss_sal) + n(s.cnss_pat)) },
        { label: p.toCnam, value: sum(s => n(s.cnam_sal) + n(s.cnam_pat)) },
        { label: p.toTax, value: sum(s => n(s.its)) },
        { label: p.totalCost, value: sum(s => n(s.salary_brut) + n(s.bonus) + n(s.cnss_pat) + n(s.cnam_pat)), strong: true },
    ];
    const monthLabel = (m: number) => new Date(2000, m - 1, 1).toLocaleDateString(language === 'ar' ? 'ar-u-nu-latn' : language, { month: 'long' });
    const narrowInput = inputClass.replace('w-full', 'w-auto');

    return (
        <div className="space-y-6">
            <PageHeader title={p.title} subtitle={p.subtitle}>
                <button onClick={openRates} className={ghostBtn}><Settings2 className="w-4 h-4" />{p.rates}</button>
            </PageHeader>

            <div className="flex flex-wrap items-center gap-2">
                <select value={month} onChange={ev => changePeriod(year, Number(ev.target.value))} className={narrowInput} aria-label={p.month}>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{monthLabel(m)}</option>)}
                </select>
                <select value={year} onChange={ev => changePeriod(Number(ev.target.value), month)} className={narrowInput}>
                    {[now.getFullYear() + 1, now.getFullYear(), now.getFullYear() - 1, now.getFullYear() - 2].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <button onClick={prepare} disabled={busy} className={primaryBtn}><Wand2 className="w-4 h-4" />{p.prepare}</button>
            </div>

            <ErrorBox message={error} />
            {info && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{info}</div>}

            {slips === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : list.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{p.empty}</div>
            ) : (
                <>
                    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
                        <table className="w-full text-sm min-w-[860px]">
                            <thead className="text-white/50 text-xs border-b border-white/10">
                                <tr>
                                    <th className="text-start font-semibold px-4 py-3">{p.employee}</th>
                                    <th className="text-end font-semibold px-3 py-3">{p.gross}</th>
                                    <th className="text-end font-semibold px-3 py-3">{p.cnss}</th>
                                    <th className="text-end font-semibold px-3 py-3">{p.cnam}</th>
                                    <th className="text-end font-semibold px-3 py-3">{p.its}</th>
                                    <th className="text-end font-semibold px-3 py-3">{p.net}</th>
                                    <th className="text-start font-semibold px-3 py-3">{p.status}</th>
                                    <th className="px-3 py-3" />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {list.map(s => (
                                    <tr key={s.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold">{s.employee?.full_name_ar || s.employee?.full_name}</div>
                                            <div className="text-xs text-white/50">{s.employee?.position}</div>
                                        </td>
                                        <td className="px-3 py-3 text-end whitespace-nowrap">
                                            {formatMoney(n(s.salary_brut) + n(s.bonus))}
                                            {n(s.bonus) > 0 && <div className="text-[11px] text-emerald-400">+{formatMoney(s.bonus)}</div>}
                                        </td>
                                        <td className="px-3 py-3 text-end whitespace-nowrap text-white/70">{formatMoney(s.cnss_sal)}</td>
                                        <td className="px-3 py-3 text-end whitespace-nowrap text-white/70">{formatMoney(s.cnam_sal)}</td>
                                        <td className="px-3 py-3 text-end whitespace-nowrap text-white/70">{formatMoney(s.its)}</td>
                                        <td className="px-3 py-3 text-end whitespace-nowrap font-bold">{formatMoney(s.net_paye)}</td>
                                        <td className="px-3 py-3">
                                            <span className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${s.is_paid ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/10 text-white/70'}`}>{s.is_paid ? p.paid : p.unpaid}</span>
                                        </td>
                                        <td className="px-3 py-3">
                                            <div className="flex justify-end gap-1">
                                                <Link href={`/admin/payroll/slip?id=${s.id}`} className="p-2 rounded-lg hover:bg-white/10" title={p.slip} aria-label={p.slip}><Printer className="w-4 h-4" /></Link>
                                                {!s.is_paid && (
                                                    <button onClick={() => setEditing({ slip: s, bonus: String(n(s.bonus)), deductions: String(n(s.deductions)), notes: s.notes ?? '' })} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer" title={p.editSlip} aria-label={p.editSlip}><Pencil className="w-4 h-4" /></button>
                                                )}
                                                {s.is_paid ? (
                                                    <button onClick={() => patch({ id: s.id, action: 'unpay' })} className="p-2 rounded-lg hover:bg-white/10 cursor-pointer" title={p.markUnpaid} aria-label={p.markUnpaid}><RotateCcw className="w-4 h-4" /></button>
                                                ) : (
                                                    <button onClick={() => patch({ id: s.id, action: 'pay' })} className="p-2 rounded-lg hover:bg-emerald-500/10 text-emerald-400 cursor-pointer" title={p.markPaid} aria-label={p.markPaid}><Check className="w-4 h-4" /></button>
                                                )}
                                                {!s.is_paid && (
                                                    <button onClick={() => remove(s)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 cursor-pointer" title={b.common.delete} aria-label={b.common.delete}><Trash2 className="w-4 h-4" /></button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="font-bold mb-4">{p.totals} — {monthLabel(month)} {year}</h2>
                        <dl className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            {totals.map(t => (
                                <div key={t.label} className={`rounded-xl p-4 ${t.strong ? 'bg-yellow-400 text-black' : 'bg-black/20'}`}>
                                    <dt className={`text-xs ${t.strong ? 'text-black/70' : 'text-white/60'}`}>{t.label}</dt>
                                    <dd className="text-lg font-bold mt-1 whitespace-nowrap">{formatMoney(t.value)}</dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </>
            )}

            {editing && (
                <Modal title={`${p.editSlip}: ${editing.slip.employee?.full_name_ar || editing.slip.employee?.full_name}`} onClose={() => setEditing(null)}>
                    <form
                        className="space-y-4"
                        onSubmit={async ev => {
                            ev.preventDefault();
                            const ok = await patch({ id: editing.slip.id, bonus: parseFloat(editing.bonus.replace(',', '.')) || 0, deductions: parseFloat(editing.deductions.replace(',', '.')) || 0, notes: editing.notes });
                            if (ok) setEditing(null);
                        }}
                    >
                        <Field label={p.bonus}><input inputMode="decimal" value={editing.bonus} onChange={ev => setEditing(x => x && { ...x, bonus: ev.target.value })} className={inputClass} /></Field>
                        <Field label={p.deductions}><input inputMode="decimal" value={editing.deductions} onChange={ev => setEditing(x => x && { ...x, deductions: ev.target.value })} className={inputClass} /></Field>
                        <Field label={b.common.notes}><input value={editing.notes} onChange={ev => setEditing(x => x && { ...x, notes: ev.target.value })} className={inputClass} /></Field>
                        <div className="flex flex-wrap gap-2 pt-2">
                            <button type="submit" className={`${primaryBtn} flex-1`}>{b.common.save}</button>
                            <button
                                type="button"
                                onClick={async () => { if (await patch({ id: editing.slip.id, recalculate: true })) setEditing(null); }}
                                className={ghostBtn}
                            >
                                {p.recalc}
                            </button>
                        </div>
                    </form>
                </Modal>
            )}

            {rates && (
                <Modal title={p.ratesTitle} onClose={() => setRates(null)}>
                    <form onSubmit={saveRates} className="space-y-4">
                        <p className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">{p.ratesHint}</p>
                        <div className="grid grid-cols-2 gap-3">
                            {(['cnssEmployee', 'cnssEmployer', 'cnamEmployee', 'cnamEmployer', 'cnssCeiling', 'abatement'] as const).map(k => (
                                <Field key={k} label={p[k]}>
                                    <input inputMode="decimal" value={String(rates[k])} onChange={ev => setRates(r => r && { ...r, [k]: ev.target.value as unknown as number })} className={inputClass} />
                                </Field>
                            ))}
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-white/70 mb-2">{p.itsScale}</div>
                            <div className="space-y-2">
                                {rates.its.map((br, i) => {
                                    const last = i === rates.its.length - 1;
                                    const setBr = (key: 'upTo' | 'rate', value: string) =>
                                        setRates(r => r && { ...r, its: r.its.map((x, j) => (j === i ? { ...x, [key]: value } : x)) as PayrollRates['its'] });
                                    return (
                                        <div key={i} className="flex items-center gap-2 text-sm">
                                            <span className="w-20 text-white/60 shrink-0">{last ? p.andAbove : p.upTo}</span>
                                            {!last ? <input inputMode="decimal" value={String(br.upTo ?? '')} onChange={ev => setBr('upTo', ev.target.value)} className={inputClass} /> : <span className="flex-1" />}
                                            <input inputMode="decimal" value={String(br.rate)} onChange={ev => setBr('rate', ev.target.value)} className={`${inputClass} max-w-24`} aria-label={p.rate} />
                                            <span className="text-white/60">%</span>
                                            {rates.its.length > 1 && (
                                                <button type="button" onClick={() => setRates(r => r && { ...r, its: r.its.filter((_, j) => j !== i) })} className="p-2 text-red-400 cursor-pointer" aria-label={b.common.delete}><Trash2 className="w-4 h-4" /></button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                            <button
                                type="button"
                                onClick={() => setRates(r => r && { ...r, its: [...r.its.slice(0, -1), { upTo: 0, rate: 0 }, r.its[r.its.length - 1]] })}
                                className="mt-2 text-sm font-bold text-yellow-400 hover:underline cursor-pointer"
                            >
                                {p.addBracket}
                            </button>
                        </div>
                        <div className="flex gap-2 pt-2">
                            <button type="submit" className={`${primaryBtn} flex-1`}>{b.common.save}</button>
                            <button type="button" onClick={() => setRates(null)} className={ghostBtn}>{b.common.cancel}</button>
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    );
}
