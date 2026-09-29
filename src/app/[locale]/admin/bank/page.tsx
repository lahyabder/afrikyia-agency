"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Landmark, Link2, Unlink, Check, Scale } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Field, PageHeader, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';
import { parseBfiRows } from '@/lib/bankStatement';

type Account = { id: string; bank_name: string; account_number: string | null; iban: string | null };
type TxType = 'income' | 'fee' | 'transfer' | 'expense';
type Tx = {
    id: string;
    bank_account_id: string;
    date: string;
    label: string;
    amount: number;
    type: TxType;
    reference: string | null;
    category: string | null;
    is_reconciled: boolean;
    invoice: { id: string; invoice_number: string } | null;
    expense: { id: string; expense_number: string; description: string } | null;
};
type InvoiceOption = { id: string; invoice_number: string; party: string | null; remaining: number; unlinkedPaid: number };
type ExpenseOption = { id: string; expense_number: string; description: string; date: string; amount: number };
type Pending = Tx & { suggestions: { invoices: InvoiceOption[]; expenses: ExpenseOption[] } };
type Check = { account_id: string; date: string | null; bank: number | null; computed: number | null; difference: number | null };
type Data = {
    accounts: Account[];
    transactions: Tx[];
    balances: Record<string, number>;
    checks: Check[];
    pending: Pending[];
    openInvoices: InvoiceOption[];
    freeExpenses: ExpenseOption[];
};

const OTHER_IN = ['capital', 'financing', 'other_income'];
const OTHER_OUT = ['cash_withdrawal', 'internal_transfer', 'owner_withdrawal'];

export default function BankPage() {
    const { b, formatMoney, formatDate } = useBiz();
    const k = b.bank;
    const [data, setData] = useState<Data | null>(null);
    const [filter, setFilter] = useState<'all' | TxType>('all');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [busy, setBusy] = useState(false);
    const [check, setCheck] = useState({ date: new Date().toISOString().slice(0, 10), balance: '' });
    const fileRef = useRef<HTMLInputElement>(null);

    const load = useCallback(() => {
        api<Data>('/api/biz/bank')
            .then(d => {
                setData(d);
                const c = d.checks[0];
                if (c?.date) setCheck({ date: c.date, balance: String(c.bank ?? '') });
            })
            .catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);
    useEffect(load, [load]);

    const account = data?.accounts[0];
    const accountCheck = data?.checks.find(c => c.account_id === account?.id);

    const act = async (body: Record<string, unknown>) => {
        setError('');
        try {
            await api('/api/biz/bank', 'PATCH', body);
            load();
            return true;
        } catch {
            setError(b.common.saveError);
            return false;
        }
    };

    const importFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file || !account) return;
        setBusy(true);
        setError('');
        setInfo('');
        try {
            const XLSX = await import('xlsx');
            const wb = XLSX.read(await file.arrayBuffer());
            const rows = XLSX.utils.sheet_to_json<unknown[]>(wb.Sheets[wb.SheetNames[0]], { header: 1, raw: false });
            const lines = parseBfiRows(rows);
            if (!lines.length) {
                setError(k.nothing);
                return;
            }
            const res = await api<{ imported: number; skipped: number; fees: number }>('/api/biz/bank', 'POST', { bank_account_id: account.id, lines });
            setInfo(k.imported.replace('{n}', String(res.imported)).replace('{f}', String(res.fees)).replace('{s}', String(res.skipped)));
            load();
        } catch {
            setError(b.common.saveError);
        } finally {
            setBusy(false);
        }
    };

    const saveCheck = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!account) return;
        try {
            await api('/api/biz/bank', 'PUT', { bank_account_id: account.id, date: check.date, balance: check.balance });
            load();
        } catch {
            setError(b.common.saveError);
        }
    };

    const tx = (data?.transactions ?? []).filter(t => filter === 'all' || t.type === filter);
    const types = k.types as Record<string, string>;
    const others = k.others as Record<string, string>;

    return (
        <div className="space-y-6">
            <PageHeader title={k.title} subtitle={k.subtitle}>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={importFile} className="hidden" />
                <button onClick={() => fileRef.current?.click()} disabled={busy || !account} className={primaryBtn}>
                    <Upload className="w-4 h-4" />{busy ? '…' : k.import}
                </button>
            </PageHeader>

            <p className="text-xs text-white/50 -mt-3">{k.importHint}</p>
            <ErrorBox message={error} />
            {info && <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{info}</div>}

            {account && (
                <div className="grid lg:grid-cols-2 gap-4">
                    <div className="min-w-0 bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4">
                        <span className="w-12 h-12 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0"><Landmark className="w-6 h-6" /></span>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold truncate">{account.bank_name}</div>
                            <div className="text-xs text-white/55 break-all"><span dir="ltr">{[account.account_number && `N° ${account.account_number}`, account.iban].filter(Boolean).join(' · ')}</span></div>
                            <div className="text-xs text-white/55 mt-2">{k.balance}</div>
                            <div className={`text-2xl font-bold whitespace-nowrap ${(data?.balances[account.id] ?? 0) < 0 ? 'text-red-400' : ''}`}>{formatMoney(data?.balances[account.id] ?? 0)}</div>
                        </div>
                    </div>

                    <form onSubmit={saveCheck} className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                        <div className="font-bold flex items-center gap-2"><Scale className="w-4 h-4 text-yellow-400" />{k.check}</div>
                        <p className="text-xs text-white/50">{k.checkHint}</p>
                        <div className="flex flex-wrap gap-2 items-end">
                            <Field label={k.bankBalance} className="flex-1 min-w-32">
                                <input inputMode="decimal" required value={check.balance} onChange={e => setCheck(c => ({ ...c, balance: e.target.value }))} className={inputClass} />
                            </Field>
                            <Field label={k.atDate} className="flex-1 min-w-32">
                                <input type="date" required value={check.date} onChange={e => setCheck(c => ({ ...c, date: e.target.value }))} className={inputClass} />
                            </Field>
                            <button type="submit" className={ghostBtn}>{k.save}</button>
                        </div>
                        {accountCheck?.date && accountCheck.difference !== null && (
                            <div className={`rounded-xl p-3 text-sm ${Math.abs(accountCheck.difference) < 0.01 ? 'bg-emerald-500/10 text-emerald-300' : 'bg-red-500/10 text-red-300'}`}>
                                <div className="flex justify-between"><span>{k.bankBalance} ({formatDate(accountCheck.date)})</span><b>{formatMoney(accountCheck.bank)}</b></div>
                                <div className="flex justify-between"><span>{k.computed}</span><b>{formatMoney(accountCheck.computed)}</b></div>
                                <div className="flex justify-between border-t border-white/10 mt-1 pt-1"><span>{k.difference}</span><b>{formatMoney(accountCheck.difference)}</b></div>
                                <div className="mt-1 text-xs">{Math.abs(accountCheck.difference) < 0.01 ? k.balanced : k.notBalanced}</div>
                            </div>
                        )}
                    </form>
                </div>
            )}

            {/* Lines waiting for a match */}
            {data && (
                <section className="space-y-3">
                    <h2 className="font-bold flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-yellow-400" />{k.pendingTitle}
                        {data.pending.length > 0 && <span className="min-w-6 h-6 px-2 rounded-full bg-yellow-400 text-black text-xs font-bold flex items-center justify-center">{data.pending.length}</span>}
                    </h2>
                    {data.pending.length === 0 ? (
                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">{k.allMatched}</div>
                    ) : (
                        <>
                            <p className="text-xs text-white/50">{k.pendingHint}</p>
                            {data.pending.map(p => (
                                <PendingCard key={p.id} line={p} data={data} onAct={act} />
                            ))}
                        </>
                    )}
                </section>
            )}

            <div className="flex gap-2 overflow-x-auto pt-2">
                {(['all', 'income', 'fee', 'transfer', 'expense'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer ${filter === f ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>
                        {f === 'all' ? k.filterAll : types[f]}
                    </button>
                ))}
            </div>

            {data === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : tx.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{k.empty}</div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
                    <table className="w-full text-sm min-w-[760px]">
                        <thead className="text-white/50 text-xs border-b border-white/10">
                            <tr>
                                <th className="text-start font-semibold px-4 py-3">{k.date}</th>
                                <th className="text-start font-semibold px-4 py-3">{k.label}</th>
                                <th className="text-start font-semibold px-4 py-3">{k.link}</th>
                                <th className="text-end font-semibold px-4 py-3">{k.in}</th>
                                <th className="text-end font-semibold px-4 py-3">{k.out}</th>
                                <th className="px-2 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tx.map(t => (
                                <tr key={t.id}>
                                    <td className="px-4 py-3 text-white/60 whitespace-nowrap">{formatDate(t.date)}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold">{t.label}</div>
                                        <div className="text-[11px] text-white/45">{types[t.type]}{t.reference ? <> · <span dir="ltr">{t.reference}</span></> : null}</div>
                                    </td>
                                    <td className="px-4 py-3 text-xs">
                                        {t.invoice && <Link href={`/admin/invoices/view?id=${t.invoice.id}`} className="text-yellow-400 hover:underline"><span dir="ltr">{t.invoice.invoice_number}</span></Link>}
                                        {t.expense && <span className="text-white/60"><span dir="ltr">{t.expense.expense_number}</span> · {t.expense.description}</span>}
                                        {!t.invoice && !t.expense && t.is_reconciled && t.category && others[t.category] && <span className="text-white/60">{others[t.category]}</span>}
                                        {!t.is_reconciled && <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-yellow-400/15 text-yellow-300">{k.unmatched}</span>}
                                    </td>
                                    <td className="px-4 py-3 text-end whitespace-nowrap font-bold text-emerald-400">{t.type === 'income' ? formatMoney(t.amount) : ''}</td>
                                    <td className="px-4 py-3 text-end whitespace-nowrap text-white/80">{t.type !== 'income' ? formatMoney(t.amount) : ''}</td>
                                    <td className="px-2 py-3">
                                        {t.is_reconciled && t.type !== 'fee' && (
                                            <button onClick={() => confirm(`${k.unlink}?`) && act({ id: t.id, action: 'unlink' })} className="p-2 rounded-lg hover:bg-white/10 text-white/50 cursor-pointer" title={k.unlink} aria-label={k.unlink}>
                                                <Unlink className="w-4 h-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

function PendingCard({ line, data, onAct }: { line: Pending; data: Data; onAct: (body: Record<string, unknown>) => Promise<boolean> }) {
    const { b, formatMoney, formatDate } = useBiz();
    const k = b.bank;
    const others = k.others as Record<string, string>;
    const cats = b.categories as Record<string, string>;
    const isIn = line.type === 'income';
    const [mode, setMode] = useState<'' | 'invoice' | 'expense' | 'create' | 'other'>('');
    const [invoiceId, setInvoiceId] = useState('');
    const [existing, setExisting] = useState(false);
    const [expenseId, setExpenseId] = useState('');
    const [category, setCategory] = useState(isIn ? 'capital' : 'cash_withdrawal');
    const [expCategory, setExpCategory] = useState('other');
    const [description, setDescription] = useState(line.label);
    const [cash, setCash] = useState(false);
    const [saving, setSaving] = useState(false);

    const run = async (body: Record<string, unknown>) => {
        setSaving(true);
        await onAct({ id: line.id, ...body });
        setSaving(false);
    };

    const pickInvoice = (id: string) => {
        setInvoiceId(id);
        const inv = data.openInvoices.find(i => i.id === id);
        setExisting(!!inv && inv.unlinkedPaid >= line.amount - 0.01);
    };

    const tab = (m: typeof mode, label: string) => (
        <button type="button" onClick={() => setMode(mode === m ? '' : m)} className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${mode === m ? 'bg-white text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}>{label}</button>
    );

    return (
        <div className="bg-white/5 border border-yellow-400/25 rounded-2xl p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="font-semibold">{line.label}</div>
                    <div className="text-xs text-white/50">{formatDate(line.date)}{line.reference ? <> · <span dir="ltr">{line.reference}</span></> : null}</div>
                </div>
                <div className={`font-bold whitespace-nowrap ${isIn ? 'text-emerald-400' : 'text-white'}`}>{isIn ? '+' : '−'} {formatMoney(line.amount)}</div>
            </div>

            {(line.suggestions.invoices.length > 0 || line.suggestions.expenses.length > 0) && (
                <div className="flex flex-wrap gap-2">
                    {line.suggestions.invoices.map(inv => {
                        const already = inv.unlinkedPaid >= line.amount - 0.01;
                        return (
                            <button key={inv.id} disabled={saving} onClick={() => run({ action: 'invoice', invoice_id: inv.id, mode: already ? 'existing' : 'add' })} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 cursor-pointer">
                                <Check className="w-4 h-4" />{k.suggested}: <span dir="ltr">{inv.invoice_number}</span>{inv.party ? ` · ${inv.party}` : ''}
                            </button>
                        );
                    })}
                    {line.suggestions.expenses.map(exp => (
                        <button key={exp.id} disabled={saving} onClick={() => run({ action: 'expense', expense_id: exp.id })} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/15 text-emerald-300 text-sm font-semibold hover:bg-emerald-500/25 cursor-pointer">
                            <Check className="w-4 h-4" />{k.suggested}: <span dir="ltr">{exp.expense_number}</span> · {exp.description}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                {isIn ? tab('invoice', k.linkInvoice) : <>{tab('create', k.createExpense)}{tab('expense', k.linkExpense)}</>}
                {tab('other', k.other)}
            </div>

            {mode === 'invoice' && (
                <div className="space-y-2">
                    <select value={invoiceId} onChange={e => pickInvoice(e.target.value)} className={inputClass}>
                        <option value="">{k.chooseInvoice}</option>
                        {data.openInvoices.map(i => (
                            <option key={i.id} value={i.id}>{i.invoice_number} · {i.party ?? ''} · {k.remaining} {formatMoney(i.remaining)}</option>
                        ))}
                    </select>
                    <label className="flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                        <input type="checkbox" checked={existing} onChange={e => setExisting(e.target.checked)} className="accent-yellow-400" />{k.alreadyRecorded}
                    </label>
                    <button disabled={!invoiceId || saving} onClick={() => run({ action: 'invoice', invoice_id: invoiceId, mode: existing ? 'existing' : 'add' })} className={primaryBtn}>{k.confirm}</button>
                </div>
            )}

            {mode === 'expense' && (
                <div className="space-y-2">
                    <select value={expenseId} onChange={e => setExpenseId(e.target.value)} className={inputClass}>
                        <option value="">{k.chooseExpense}</option>
                        {data.freeExpenses.map(e => (
                            <option key={e.id} value={e.id}>{e.expense_number} · {e.description} · {formatMoney(e.amount)} · {formatDate(e.date)}</option>
                        ))}
                    </select>
                    <button disabled={!expenseId || saving} onClick={() => run({ action: 'expense', expense_id: expenseId })} className={primaryBtn}>{k.confirm}</button>
                </div>
            )}

            {mode === 'create' && (
                <div className="grid sm:grid-cols-2 gap-2">
                    <Field label={k.category}>
                        <select value={expCategory} onChange={e => setExpCategory(e.target.value)} className={inputClass}>
                            {Object.entries(cats).map(([key, v]) => <option key={key} value={key}>{v}</option>)}
                        </select>
                    </Field>
                    <Field label={k.description}>
                        <input value={description} onChange={e => setDescription(e.target.value)} className={inputClass} />
                    </Field>
                    <label className="sm:col-span-2 flex items-center gap-2 text-xs text-white/70 cursor-pointer">
                        <input type="checkbox" checked={cash} onChange={e => setCash(e.target.checked)} className="accent-yellow-400" />{k.paidCash}
                    </label>
                    <div className="sm:col-span-2">
                        <button disabled={saving} onClick={() => run({ action: 'expense', category: expCategory, description, cash })} className={primaryBtn}>{k.confirm}</button>
                    </div>
                </div>
            )}

            {mode === 'other' && (
                <div className="flex flex-wrap gap-2 items-center">
                    <select value={category} onChange={e => setCategory(e.target.value)} className={inputClass.replace('w-full', 'w-auto')}>
                        {(isIn ? OTHER_IN : OTHER_OUT).map(c => <option key={c} value={c}>{others[c]}</option>)}
                    </select>
                    <button disabled={saving} onClick={() => run({ action: 'other', category })} className={primaryBtn}>{k.confirm}</button>
                </div>
            )}
        </div>
    );
}
