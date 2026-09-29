"use client";

import { useCallback, useEffect, useRef, useState } from 'react';
import { Upload, Landmark } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { PageHeader, ErrorBox, primaryBtn, api, useBiz } from '@/components/admin/biz/ui';
import { parseBfiRows } from '@/lib/bankStatement';

type Account = { id: string; bank_name: string; account_number: string | null; iban: string | null };
type Tx = {
    id: string;
    bank_account_id: string;
    date: string;
    label: string;
    amount: number;
    type: 'income' | 'fee' | 'transfer' | 'expense';
    reference: string | null;
    invoice: { id: string; invoice_number: string } | null;
    expense: { id: string; expense_number: string } | null;
};
type Data = { accounts: Account[]; transactions: Tx[]; balances: Record<string, number> };

export default function BankPage() {
    const { b, formatMoney, formatDate } = useBiz();
    const k = b.bank;
    const [data, setData] = useState<Data | null>(null);
    const [filter, setFilter] = useState<'all' | Tx['type']>('all');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [busy, setBusy] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const load = useCallback(() => {
        api<Data>('/api/biz/bank').then(setData).catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);
    useEffect(load, [load]);

    const account = data?.accounts[0];

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

    const tx = (data?.transactions ?? []).filter(t => filter === 'all' || t.type === filter);
    const types = k.types as Record<string, string>;

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
                <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <span className="w-12 h-12 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center shrink-0"><Landmark className="w-6 h-6" /></span>
                    <div className="flex-1 min-w-0">
                        <div className="font-bold">{account.bank_name}</div>
                        <div className="text-xs text-white/55"><span dir="ltr">{[account.account_number && `N° ${account.account_number}`, account.iban].filter(Boolean).join(' · ')}</span></div>
                    </div>
                    <div className="sm:text-end">
                        <div className="text-xs text-white/55">{k.balance}</div>
                        <div className={`text-2xl font-bold whitespace-nowrap ${(data?.balances[account.id] ?? 0) < 0 ? 'text-red-400' : ''}`}>{formatMoney(data?.balances[account.id] ?? 0)}</div>
                    </div>
                </div>
            )}

            <div className="flex gap-2 overflow-x-auto">
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
                    <table className="w-full text-sm min-w-[720px]">
                        <thead className="text-white/50 text-xs border-b border-white/10">
                            <tr>
                                <th className="text-start font-semibold px-4 py-3">{k.date}</th>
                                <th className="text-start font-semibold px-4 py-3">{k.label}</th>
                                <th className="text-start font-semibold px-4 py-3">{k.link}</th>
                                <th className="text-end font-semibold px-4 py-3">{k.in}</th>
                                <th className="text-end font-semibold px-4 py-3">{k.out}</th>
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
                                        {t.expense && <Link href="/admin/expenses" className="text-white/60 hover:underline"><span dir="ltr">{t.expense.expense_number}</span></Link>}
                                    </td>
                                    <td className="px-4 py-3 text-end whitespace-nowrap font-bold text-emerald-400">{t.type === 'income' ? formatMoney(t.amount) : ''}</td>
                                    <td className="px-4 py-3 text-end whitespace-nowrap text-white/80">{t.type !== 'income' ? formatMoney(t.amount) : ''}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
