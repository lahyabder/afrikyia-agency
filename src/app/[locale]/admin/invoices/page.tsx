"use client";

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { Link, useRouter } from '@/i18n/routing';
import { PageHeader, ErrorBox, StatusBadge, inputClass, primaryBtn, ghostBtn, api, useBiz } from '@/components/admin/biz/ui';

type Doc = {
    id: string;
    invoice_number: string;
    type: 'invoice' | 'quote';
    date: string;
    due_date: string | null;
    status: string;
    total_ttc: number;
    paid_amount: number;
    party: { id: string; name: string } | null;
};

export default function DocumentsPage() {
    return (
        <Suspense fallback={null}>
            <Documents />
        </Suspense>
    );
}

function Documents() {
    const { b, formatMoney, formatDate } = useBiz();
    const d = b.docs;
    const router = useRouter();
    const [tab, setTab] = useState<'invoice' | 'quote'>(useSearchParams().get('tab') === 'quote' ? 'quote' : 'invoice');
    const [docs, setDocs] = useState<Doc[] | null>(null);
    const [search, setSearch] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        api<Doc[]>('/api/biz/documents')
            .then(setDocs)
            .catch(() => setError(b.common.loadError));
    }, [b.common.loadError]);

    const q = search.trim().toLowerCase();
    const visible = (docs ?? []).filter(x => x.type === tab && (!q || [x.invoice_number, x.party?.name].some(v => v?.toLowerCase().includes(q))));
    const count = (type: string) => (docs ?? []).filter(x => x.type === type).length;

    return (
        <div className="space-y-6">
            <PageHeader title={d.title} subtitle={d.subtitle}>
                <Link href="/admin/invoices/edit?type=quote" className={ghostBtn}><Plus className="w-4 h-4" />{d.newQuote}</Link>
                <Link href="/admin/invoices/edit?type=invoice" className={primaryBtn}><Plus className="w-4 h-4" />{d.newInvoice}</Link>
            </PageHeader>

            <ErrorBox message={error} />

            <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2">
                    {(['invoice', 'quote'] as const).map(x => (
                        <button
                            key={x}
                            onClick={() => setTab(x)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap cursor-pointer ${tab === x ? 'bg-yellow-400 text-black' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                        >
                            {x === 'invoice' ? d.invoices : d.quotes} <span className="opacity-70">({count(x)})</span>
                        </button>
                    ))}
                </div>
                <div className="relative flex-1">
                    <Search className="w-4 h-4 text-white/40 absolute top-1/2 -translate-y-1/2 start-4" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder={b.common.search} className={`${inputClass} ps-11`} />
                </div>
            </div>

            {docs === null && !error ? (
                <div className="text-white/60 text-sm py-10 text-center">{b.common.loading}</div>
            ) : visible.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-2xl py-14 text-center text-white/60 text-sm">{b.common.empty}</div>
            ) : (
                <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="text-white/50 text-xs border-b border-white/10">
                            <tr>
                                <th className="text-start font-semibold px-4 py-3">{d.number}</th>
                                <th className="text-start font-semibold px-4 py-3">{d.client}</th>
                                <th className="text-start font-semibold px-4 py-3 hidden md:table-cell">{b.common.date}</th>
                                <th className="text-start font-semibold px-4 py-3">{d.totalTtc}</th>
                                <th className="text-start font-semibold px-4 py-3 hidden sm:table-cell">{d.status}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {visible.map(x => (
                                <tr key={x.id} onClick={() => router.push(`/admin/invoices/view?id=${x.id}`)} className="hover:bg-white/5 cursor-pointer">
                                    <td className="px-4 py-3 font-mono text-xs"><span dir="ltr">{x.invoice_number}</span></td>
                                    <td className="px-4 py-3 font-semibold">{x.party?.name ?? '—'}</td>
                                    <td className="px-4 py-3 hidden md:table-cell text-white/60">{formatDate(x.date)}</td>
                                    <td className="px-4 py-3 font-bold whitespace-nowrap">{formatMoney(x.total_ttc)}</td>
                                    <td className="px-4 py-3 hidden sm:table-cell"><StatusBadge status={x.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
