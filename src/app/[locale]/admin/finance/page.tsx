"use client";

import { useEffect, useState } from 'react';
import { Plus, ArrowDownLeft, ArrowUpRight, Scale, Clock } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { PageHeader, ErrorBox, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';

type Summary = {
    year: number;
    income: number;
    expenses: number;
    net: number;
    receivable: number;
    months: { month: number; income: number; expenses: number }[];
    byCategory: Record<string, number>;
    open: { id: string; invoice_number: string; date: string; due_date: string | null; due: number; late: boolean; party: { name: string } | null }[];
};

export default function FinancePage() {
    const { b, language, formatMoney, formatDate } = useBiz();
    const f = b.finance;
    const cats = b.categories as Record<string, string>;
    const thisYear = new Date().getFullYear();
    const [year, setYear] = useState(thisYear);
    const [data, setData] = useState<Summary | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        api<Summary>(`/api/biz/summary?year=${year}`)
            .then(d => { setData(d); setError(''); })
            .catch(() => setError(b.common.loadError));
    }, [year, b.common.loadError]);

    const cards = [
        { label: f.income, hint: f.incomeHint, value: data?.income, icon: ArrowDownLeft, color: 'text-emerald-400 bg-emerald-500/10' },
        { label: f.expenses, value: data?.expenses, icon: ArrowUpRight, color: 'text-red-400 bg-red-500/10' },
        { label: f.net, hint: f.netHint, value: data?.net, icon: Scale, color: 'text-yellow-400 bg-yellow-500/10' },
        { label: f.receivable, value: data?.receivable, icon: Clock, color: 'text-blue-300 bg-blue-500/10' },
    ];

    const max = Math.max(1, ...(data?.months ?? []).flatMap(m => [m.income, m.expenses]));
    const monthName = (m: number) =>
        new Date(2000, m - 1, 1).toLocaleDateString(language === 'ar' ? 'ar-u-nu-latn' : language, { month: 'short' });
    const categories = Object.entries(data?.byCategory ?? {}).sort((a, c) => c[1] - a[1]);
    const catTotal = categories.reduce((s, [, v]) => s + v, 0) || 1;

    return (
        <div className="space-y-6">
            <PageHeader title={f.title} subtitle={f.subtitle}>
                <select value={year} onChange={e => { setData(null); setYear(Number(e.target.value)); }} className={inputClass.replace("w-full", "w-28")} aria-label={f.year}>
                    {[thisYear, thisYear - 1, thisYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <Link href="/admin/expenses" className={ghostBtn}><Plus className="w-4 h-4" />{f.newExpense}</Link>
                <Link href="/admin/invoices/edit?type=quote" className={ghostBtn}><Plus className="w-4 h-4" />{f.newQuote}</Link>
                <Link href="/admin/invoices/edit?type=invoice" className={primaryBtn}><Plus className="w-4 h-4" />{f.newInvoice}</Link>
            </PageHeader>

            <ErrorBox message={error} />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {cards.map(c => (
                    <div key={c.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                        <div className="flex items-center gap-3">
                            <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}><c.icon className="w-5 h-5" /></span>
                            <span className="text-sm text-white/70 font-semibold">{c.label}</span>
                        </div>
                        <div className="text-2xl font-bold mt-4 whitespace-nowrap">
                            {c.value === undefined ? <span className="inline-block w-28 h-7 rounded bg-white/10 animate-pulse" /> : formatMoney(c.value)}
                        </div>
                        {c.hint && <div className="text-xs text-white/45 mt-1">{c.hint}</div>}
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="font-bold">{f.byMonth}</h2>
                        <div className="flex gap-4 text-xs text-white/60">
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />{f.income}</span>
                            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400" />{f.expenses}</span>
                        </div>
                    </div>
                    <div className="h-48 flex items-end gap-1.5 sm:gap-3" dir="ltr">
                        {(data?.months ?? Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expenses: 0 }))).map(m => (
                            <div key={m.month} className="flex-1 min-w-0 flex flex-col items-center gap-1.5 h-full">
                                <div className="flex-1 w-full flex items-end justify-center gap-0.5">
                                    <div className="w-1/2 max-w-3 bg-emerald-400 rounded-t" style={{ height: `${(m.income / max) * 100}%` }} title={formatMoney(m.income)} />
                                    <div className="w-1/2 max-w-3 bg-red-400 rounded-t" style={{ height: `${(m.expenses / max) * 100}%` }} title={formatMoney(m.expenses)} />
                                </div>
                                <span className="text-[10px] text-white/45"><span className="sm:hidden">{m.month}</span><span className="hidden sm:inline">{monthName(m.month)}</span></span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h2 className="font-bold mb-4">{f.byCategory}</h2>
                    {categories.length === 0 ? (
                        <p className="text-sm text-white/55">{b.common.empty}</p>
                    ) : (
                        <ul className="space-y-3">
                            {categories.map(([k, v]) => (
                                <li key={k}>
                                    <div className="flex justify-between text-sm"><span>{cats[k] ?? k}</span><span className="font-semibold whitespace-nowrap">{formatMoney(v)}</span></div>
                                    <div className="h-1.5 bg-white/10 rounded-full mt-1.5"><div className="h-full bg-red-400 rounded-full" style={{ width: `${(v / catTotal) * 100}%` }} /></div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                <h2 className="font-bold mb-4">{f.open}</h2>
                {data && data.open.length === 0 ? (
                    <p className="text-sm text-white/55">{f.noOpen}</p>
                ) : (
                    <ul className="divide-y divide-white/5">
                        {(data?.open ?? []).map(o => (
                            <li key={o.id}>
                                <Link href={`/admin/invoices/view?id=${o.id}`} className="flex items-center gap-3 py-3 hover:text-yellow-400">
                                    <span className="font-mono text-xs text-white/55" dir="ltr">{o.invoice_number}</span>
                                    <span className="flex-1 font-semibold truncate">{o.party?.name}</span>
                                    {o.late && <span className="text-[11px] px-2 py-0.5 rounded-md font-bold bg-red-500/15 text-red-400">{f.late}</span>}
                                    <span className="text-xs text-white/50 hidden sm:inline">{formatDate(o.due_date || o.date)}</span>
                                    <span className="font-bold whitespace-nowrap">{formatMoney(o.due)}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}
